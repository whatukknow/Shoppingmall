import {
  ANALYTICS_PAGE_TITLE,
  safeItemId,
  safeItemName,
  safePageLocation,
  safePageReferrer,
  validMeasurementId,
} from './safety';

export type RecommendationClick = {
  itemId: string;
  itemName?: string;
  index: number;
  source: 'personalized' | 'random';
};

export type PurchaseEvent = {
  transactionId: string;
  currency: 'KRW';
  value: number;
  shipping: number;
  items: Array<{
    item_id?: string;
    item_name?: string;
    price: number;
    quantity: number;
  }>;
};

export type AnalyticsHost = {
  command: (...args: unknown[]) => void;
  location: () => string;
  referrer: () => string;
  storage: () => Pick<Storage, 'getItem' | 'setItem'> | undefined;
};

type PageContext = {
  page_location: string;
  page_referrer: string;
  page_title: string;
};

type AllowedEvent =
  'page_view' | 'sign_up' | 'taste_profile_saved' | 'select_item' | 'purchase';

type QueuedEvent = {
  name: AllowedEvent;
  parameters: Record<string, unknown>;
  page: PageContext;
  transactionId?: string;
};

export const MAX_ANALYTICS_QUEUE = 50;
const MAX_PURCHASE_MARKERS = 100;

function money(value: unknown): value is number {
  return typeof value === 'number' && Number.isSafeInteger(value) && value >= 0;
}

/**
 * A true result means accepted into our queue or handed to gtag, never a GA receipt.
 * The injected host keeps tests synthetic: no Google script, network or real storage.
 */
export function createAnalyticsClient({
  measurementId: rawMeasurementId,
  debug = false,
  host,
}: {
  measurementId?: string;
  debug?: boolean;
  host?: AnalyticsHost;
}) {
  const measurementId = validMeasurementId(rawMeasurementId);
  const storageKey = `little-portions:ga4:purchases:${measurementId}`;
  let initialized = false;
  let ready = false;
  let failed = false;
  let lastPagePathname = '';
  let lastPageLocation = '';
  let currentPageReferrer: string | undefined;
  const queue: QueuedEvent[] = [];
  const pendingPurchases = new Set<string>();
  const sentPurchases = new Set<string>();

  function pageContext(): PageContext {
    const pageLocation = safePageLocation(host?.location() ?? '');
    return {
      page_location: pageLocation,
      page_referrer: safePageReferrer(
        currentPageReferrer ?? host?.referrer() ?? '',
        pageLocation,
      ),
      page_title: ANALYTICS_PAGE_TITLE,
    };
  }

  function privacyParameters() {
    return {
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      ...(debug === true ? { debug_mode: true } : {}),
    };
  }

  function initialize(): boolean {
    if (!measurementId || !host || failed) return false;
    if (initialized) return true;
    try {
      const page = pageContext();
      if (!page.page_location) return false;
      // Queue safe defaults BEFORE config/js; never let callback URLs be defaults.
      host.command('set', { ...page, ...privacyParameters() });
      host.command('js', new Date());
      host.command('config', measurementId, {
        ...page,
        ...privacyParameters(),
        send_page_view: false,
      });
      initialized = true;
      return true;
    } catch {
      return false;
    }
  }

  function loadPurchaseMarkers(): string[] {
    try {
      const stored = host?.storage()?.getItem(storageKey);
      const markers: unknown = stored ? JSON.parse(stored) : [];
      return Array.isArray(markers)
        ? markers
            .filter(
              (id): id is string =>
                typeof id === 'string' && /^[a-f0-9]{64}$/.test(id),
            )
            .slice(-MAX_PURCHASE_MARKERS)
        : [];
    } catch {
      return [];
    }
  }

  function rememberPurchase(transactionId: string) {
    sentPurchases.add(transactionId);
    // Storage failures must never affect payment confirmation or page rendering.
    try {
      const markers = new Set([...loadPurchaseMarkers(), transactionId]);
      host
        ?.storage()
        ?.setItem(
          storageKey,
          JSON.stringify([...markers].slice(-MAX_PURCHASE_MARKERS)),
        );
    } catch {
      // In-memory dedupe remains available for this document.
    }
  }

  function handoff(event: QueuedEvent): boolean {
    try {
      if (!measurementId || !host) return false;
      host.command('set', { ...event.page, ...privacyParameters() });
      host.command('event', event.name, {
        ...event.parameters,
        ...event.page,
        ...privacyParameters(),
        send_to: measurementId,
      });
      if (event.transactionId) rememberPurchase(event.transactionId);
      return true;
    } catch {
      return false;
    } finally {
      if (event.transactionId) pendingPurchases.delete(event.transactionId);
    }
  }

  function enqueue(
    name: AllowedEvent,
    parameters: Record<string, unknown>,
    transactionId?: string,
  ): boolean {
    if (!initialize()) return false;
    const page = pageContext();
    if (!page.page_location) return false;
    const event = { name, parameters, page, transactionId };
    if (ready) return handoff(event);
    if (queue.length >= MAX_ANALYTICS_QUEUE) return false;
    queue.push(event);
    if (transactionId) pendingPurchases.add(transactionId);
    return true;
  }

  function sdkReady(): void {
    if (!initialize()) return;
    ready = true;
    while (queue.length) {
      const event = queue.shift();
      if (event) handoff(event);
    }
    try {
      host?.command('set', { ...pageContext(), ...privacyParameters() });
    } catch {
      // Optional analytics must not interrupt the app.
    }
  }

  function sdkFailed(): void {
    ready = false;
    failed = true;
    queue.length = 0;
    pendingPurchases.clear();
  }

  function trackPageView(): boolean {
    try {
      const rawUrl = host?.location() ?? '';
      const location = safePageLocation(rawUrl);
      // Local comparison only: dynamic segments never enter an analytics payload.
      const pathname = new URL(rawUrl).pathname;
      if (!location || pathname === lastPagePathname) return false;
      const previousReferrer = currentPageReferrer;
      if (lastPageLocation) currentPageReferrer = lastPageLocation;
      const accepted = enqueue('page_view', {});
      if (accepted) {
        lastPagePathname = pathname;
        lastPageLocation = location;
      } else {
        currentPageReferrer = previousReferrer;
      }
      return accepted;
    } catch {
      return false;
    }
  }

  function trackSignUp(): boolean {
    try {
      return enqueue('sign_up', { method: 'email' });
    } catch {
      return false;
    }
  }

  function trackTasteProfileSaved(input: {
    recommendationCount: number;
  }): boolean {
    try {
      const count = input.recommendationCount;
      if (!Number.isSafeInteger(count) || count < 0 || count > 200)
        return false;
      return enqueue('taste_profile_saved', { recommendation_count: count });
    } catch {
      return false;
    }
  }

  function trackRecommendationClick(input: RecommendationClick): boolean {
    try {
      const itemId = safeItemId(input.itemId);
      const itemName = safeItemName(input.itemName);
      if (
        !itemId ||
        !Number.isSafeInteger(input.index) ||
        input.index < 0 ||
        input.index > 199 ||
        !['personalized', 'random'].includes(input.source)
      ) {
        return false;
      }
      return enqueue('select_item', {
        item_list_id: 'ai_recommendations',
        source: input.source,
        index: input.index,
        items: [
          {
            item_id: itemId,
            ...(itemName ? { item_name: itemName } : {}),
            index: input.index,
          },
        ],
      });
    } catch {
      return false;
    }
  }

  function trackPurchase(input: PurchaseEvent): boolean {
    try {
      if (!measurementId || !host || failed) return false;
      const id = input.transactionId;
      if (
        typeof id !== 'string' ||
        !/^[a-f0-9]{64}$/.test(id) ||
        input.currency !== 'KRW' ||
        !money(input.value) ||
        !money(input.shipping) ||
        !Array.isArray(input.items) ||
        input.items.length === 0 ||
        input.items.length > 200
      ) {
        return false;
      }
      if (
        pendingPurchases.has(id) ||
        sentPurchases.has(id) ||
        loadPurchaseMarkers().includes(id)
      ) {
        return false;
      }
      const items = input.items.map((item) => {
        const itemId = safeItemId(item.item_id);
        const itemName = safeItemName(item.item_name);
        if (
          (!itemId && !itemName) ||
          !money(item.price) ||
          !Number.isSafeInteger(item.quantity) ||
          item.quantity < 1 ||
          item.quantity > 10000
        ) {
          throw new Error('Invalid analytics item');
        }
        return {
          ...(itemId ? { item_id: itemId } : {}),
          ...(itemName ? { item_name: itemName } : {}),
          price: item.price,
          quantity: item.quantity,
        };
      });
      const subtotal = items.reduce(
        (sum, item) => sum + item.price * item.quantity,
        0,
      );
      if (!money(subtotal) || subtotal !== input.value) return false;
      return enqueue(
        'purchase',
        {
          transaction_id: id,
          currency: 'KRW',
          value: input.value,
          shipping: input.shipping,
          items,
        },
        id,
      );
    } catch {
      return false;
    }
  }

  return {
    measurementId,
    initialize,
    sdkReady,
    sdkFailed,
    trackPageView,
    trackSignUp,
    trackTasteProfileSaved,
    trackRecommendationClick,
    trackPurchase,
  };
}
