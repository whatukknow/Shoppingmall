import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  createAnalyticsClient,
  MAX_ANALYTICS_QUEUE,
  type AnalyticsHost,
  type PurchaseEvent,
} from '../../shared/lib/analytics/runtime';
import {
  ANALYTICS_PAGE_TITLE,
  safePageLocation,
  safePageReferrer,
  validMeasurementId,
} from '../../shared/lib/analytics/safety';

const MEASUREMENT_ID = 'G-SYNTHETIC1';
const FIRST_TRANSACTION = 'a'.repeat(64);
const SECOND_TRANSACTION = 'b'.repeat(64);

function purchase(transactionId = FIRST_TRANSACTION): PurchaseEvent {
  return {
    transactionId,
    currency: 'KRW',
    value: 2400,
    shipping: 3000,
    items: [{ item_name: '양파', price: 1200, quantity: 2 }],
  };
}

function fixture({
  measurementId = MEASUREMENT_ID,
  debug = false,
  storage = new Map<string, string>(),
  storageThrows = false,
} = {}) {
  const calls: unknown[][] = [];
  let location =
    'https://shop.example/products?email=secret%40example.com#token';
  let commandThrows = false;
  const host: AnalyticsHost = {
    command: (...args) => {
      if (commandThrows) throw new Error('Synthetic SDK error');
      calls.push(args);
    },
    location: () => location,
    referrer: () =>
      'https://auth.example/callback/account-private?access_token=private#email',
    storage: () => {
      if (storageThrows) throw new Error('Synthetic blocked storage');
      return {
        getItem: (key) => storage.get(key) ?? null,
        setItem: (key, value) => {
          storage.set(key, value);
        },
      };
    },
  };
  const client = createAnalyticsClient({ measurementId, debug, host });
  return {
    client,
    calls,
    storage,
    setLocation: (value: string) => {
      location = value;
    },
    setCommandThrows: (value: boolean) => {
      commandThrows = value;
    },
    events: () =>
      calls
        .filter((call) => call[0] === 'event')
        .map((call) => ({
          name: String(call[1]),
          parameters: call[2] as Record<string, unknown>,
        })),
  };
}

describe('GA4 safe page context', () => {
  it('accepts only optional, structurally valid G- measurement IDs', () => {
    for (const id of [
      undefined,
      '',
      'G-',
      'AW-123456',
      'g-ABCDEF',
      'G-ABC?email',
    ]) {
      assert.equal(validMeasurementId(id), null);
    }
    assert.equal(validMeasurementId(MEASUREMENT_ID), MEASUREMENT_ID);
  });

  it('removes all query/fragment contents and every sensitive dynamic route ID', () => {
    const examples = [
      [
        'https://shop.example/payment/pay-completed?paymentKey=private&orderId=123#email',
        '/payment/pay-completed',
      ],
      [
        'https://shop.example/login?next=%2Fauth%3Faccess_token%3Dprivate#token',
        '/login',
      ],
      [
        'https://shop.example/products/person%2540example.com?auth=private#payment',
        '/products/item',
      ],
      [
        'https://shop.example/pods/product/account-123?email=x#token',
        '/pods/product/item',
      ],
      [
        'https://shop.example/pods/completed/private-pod?orderId=123',
        '/pods/completed/item',
      ],
      ['https://shop.example/account/person%40example.com', '/other'],
      [
        'https://shop.example/%70ayment/pay-completed?paymentKey=private',
        '/other',
      ],
      ['https://shop.example/products/private/extra?email=x', '/other'],
    ];
    for (const [url, expected] of examples) {
      assert.equal(safePageLocation(url), `https://shop.example${expected}`);
    }
    assert.equal(safePageLocation('javascript:alert(1)'), '');
    assert.equal(safePageLocation('invalid'), '');
  });

  it('sanitizes same-site referrers and reduces external URLs to origin', () => {
    const page = 'https://shop.example/';
    assert.equal(
      safePageReferrer(
        'https://shop.example/pods/completed/private?token=secret#email',
        page,
      ),
      'https://shop.example/pods/completed/item',
    );
    assert.equal(
      safePageReferrer(
        'https://account:private@auth.example/private?email=private#token',
        page,
      ),
      'https://auth.example/',
    );
    assert.equal(safePageReferrer('data:text/plain,private', page), '');
  });

  it('sets safe defaults before SDK config, disables defaults/signals, and uses a static title', () => {
    const f = fixture();
    f.setLocation(
      'https://shop.example/payment/pay-completed?paymentKey=private#token',
    );
    assert.equal(f.client.initialize(), true);
    assert.deepEqual(
      f.calls.map((call) => call[0]),
      ['set', 'js', 'config'],
    );
    const config = f.calls[2][2] as Record<string, unknown>;
    assert.equal(config.send_page_view, false);
    assert.equal(config.allow_google_signals, false);
    assert.equal(config.allow_ad_personalization_signals, false);
    assert.equal(
      config.page_location,
      'https://shop.example/payment/pay-completed',
    );
    assert.equal(config.page_referrer, 'https://auth.example/');
    assert.equal(config.page_title, ANALYTICS_PAGE_TITLE);
    assert.equal('debug_mode' in config, false);
    assert.doesNotMatch(JSON.stringify(f.calls), /paymentKey|private|#token/);
  });

  it('counts initial + SPA route views once through repeated effects and keeps sanitized SPA referrers', () => {
    const f = fixture();
    f.client.trackPageView();
    assert.equal(f.client.trackPageView(), false);
    f.client.sdkReady();
    f.client.sdkReady();
    f.setLocation('https://shop.example/products/private-item?token=secret');
    assert.equal(f.client.trackPageView(), true);
    assert.equal(f.client.trackPageView(), false);
    f.setLocation('https://shop.example/products/another-item?email=secret');
    assert.equal(f.client.trackPageView(), true);
    f.setLocation(
      'https://shop.example/payment/pay-completed?paymentKey=secret',
    );
    assert.equal(f.client.trackPageView(), true);
    const views = f.events();
    assert.equal(views.length, 4);
    assert.equal(
      views[1].parameters.page_referrer,
      'https://shop.example/products',
    );
    assert.equal(
      views[2].parameters.page_referrer,
      'https://shop.example/products/item',
    );
    assert.equal(
      views[3].parameters.page_referrer,
      'https://shop.example/products/item',
    );
    f.setLocation(
      'https://shop.example/payment/pay-completed?paymentKey=different#hash',
    );
    assert.equal(f.client.trackPageView(), false);
    assert.doesNotMatch(
      JSON.stringify(f.calls),
      /private-item|another-item|paymentKey|secret/,
    );
  });
});

describe('GA4 optional queue and allowlisted events', () => {
  it('does nothing without a valid measurement ID or browser host', () => {
    for (const measurementId of ['', 'not-valid']) {
      const f = fixture({ measurementId });
      assert.equal(f.client.initialize(), false);
      assert.equal(f.client.trackSignUp(), false);
      assert.equal(f.client.trackPageView(), false);
      assert.equal(f.client.trackPurchase(purchase()), false);
      f.client.sdkReady();
      assert.deepEqual(f.calls, []);
      assert.equal(f.storage.size, 0);
    }
    assert.equal(
      createAnalyticsClient({ measurementId: MEASUREMENT_ID }).initialize(),
      false,
    );
  });

  it('queues before readiness, flushes once in order, and only emits fixed allowed fields', () => {
    const f = fixture();
    assert.equal(f.client.trackSignUp(), true);
    assert.equal(
      f.client.trackTasteProfileSaved({
        recommendationCount: 4,
        email: 'private',
        answers: ['private'],
      } as { recommendationCount: number }),
      true,
    );
    assert.equal(
      f.client.trackRecommendationClick({
        itemId: 'raw-onion',
        itemName: '양파',
        index: 1,
        source: 'personalized',
        user_id: 'private',
      } as Parameters<typeof f.client.trackRecommendationClick>[0]),
      true,
    );
    assert.equal(f.events().length, 0);
    f.client.sdkReady();
    f.client.sdkReady();
    assert.deepEqual(
      f.events().map((event) => event.name),
      ['sign_up', 'taste_profile_saved', 'select_item'],
    );
    assert.equal(f.events()[0].parameters.method, 'email');
    assert.equal(f.events()[1].parameters.recommendation_count, 4);
    assert.deepEqual(f.events()[2].parameters.items, [
      { item_id: 'raw-onion', item_name: '양파', index: 1 },
    ]);
    assert.equal(f.events()[2].parameters.item_list_id, 'ai_recommendations');
    assert.equal(f.events()[2].parameters.source, 'personalized');
    assert.doesNotMatch(JSON.stringify(f.events()), /private|user_id|answers/);
    for (const event of f.events()) {
      assert.equal(event.parameters.send_to, MEASUREMENT_ID);
      assert.equal(
        event.parameters.page_location,
        'https://shop.example/products',
      );
      assert.equal(event.parameters.page_referrer, 'https://auth.example/');
    }
  });

  it('validates recommendations/counts and drops unsafe optional names', () => {
    const f = fixture();
    f.client.sdkReady();
    for (const recommendationCount of [-1, 1.5, Number.NaN, 201]) {
      assert.equal(
        f.client.trackTasteProfileSaved({ recommendationCount }),
        false,
      );
    }
    assert.equal(
      f.client.trackRecommendationClick({
        itemId: 'person@example.com',
        index: 0,
        source: 'random',
      }),
      false,
    );
    assert.equal(
      f.client.trackRecommendationClick({
        itemId: 'onion',
        index: -1,
        source: 'random',
      }),
      false,
    );
    assert.equal(
      f.client.trackRecommendationClick({
        itemId: 'onion',
        index: 0,
        source: 'form',
      } as unknown as Parameters<typeof f.client.trackRecommendationClick>[0]),
      false,
    );
    assert.equal(
      f.client.trackRecommendationClick({
        itemId: 'onion',
        itemName: 'person@example.com',
        index: 0,
        source: 'random',
      }),
      true,
    );
    assert.deepEqual(f.events()[0].parameters.items, [
      { item_id: 'onion', index: 0 },
    ]);
  });

  it('bounds pre-load traffic and catches SDK initialization/handoff errors', () => {
    const f = fixture();
    for (let index = 0; index < MAX_ANALYTICS_QUEUE; index += 1) {
      assert.equal(f.client.trackSignUp(), true);
    }
    assert.equal(f.client.trackSignUp(), false);
    f.client.sdkReady();
    assert.equal(f.events().length, MAX_ANALYTICS_QUEUE);
    const failing = fixture();
    failing.setCommandThrows(true);
    assert.equal(failing.client.initialize(), false);
    assert.equal(failing.client.trackSignUp(), false);
    assert.doesNotThrow(() => failing.client.sdkReady());
    failing.setCommandThrows(false);
    failing.client.sdkReady();
    failing.setCommandThrows(true);
    assert.equal(failing.client.trackSignUp(), false);
  });

  it('handles SDK load failure without emitting or marking queued purchases', () => {
    const f = fixture();
    assert.equal(f.client.trackPurchase(purchase()), true);
    f.client.sdkFailed();
    f.client.sdkReady();
    assert.equal(f.events().length, 0);
    assert.equal(f.storage.size, 0);
    assert.equal(f.client.trackPurchase(purchase()), false);
    const refreshed = fixture({ storage: f.storage });
    refreshed.client.sdkReady();
    assert.equal(refreshed.client.trackPurchase(purchase()), true);
  });

  it('uses debug_mode only when the explicit debug option is true', () => {
    const f = fixture({ debug: true });
    f.client.sdkReady();
    f.client.trackSignUp();
    assert.equal(f.events()[0].parameters.debug_mode, true);
    assert.equal((f.calls[2][2] as Record<string, unknown>).debug_mode, true);
  });
});

describe('GA4 purchase handoff deduplication', () => {
  it('deduplicates one order while queued, across remount and across synthetic refresh', () => {
    const f = fixture();
    assert.equal(f.client.trackPurchase(purchase()), true);
    assert.equal(f.client.trackPurchase(purchase()), false);
    assert.equal(f.storage.size, 0);
    f.client.sdkReady();
    f.client.sdkReady();
    assert.equal(f.client.trackPurchase(purchase()), false);
    assert.equal(f.events().length, 1);
    const refreshed = fixture({ storage: f.storage });
    refreshed.client.sdkReady();
    assert.equal(refreshed.client.trackPurchase(purchase()), false);
    assert.equal(refreshed.events().length, 0);
    assert.equal(f.events()[0].parameters.value, 2400);
    assert.equal(f.events()[0].parameters.shipping, 3000);
    assert.equal(f.events()[0].parameters.transaction_id, FIRST_TRANSACTION);
  });

  it('keeps different orders and different properties independent', () => {
    const f = fixture();
    f.client.sdkReady();
    assert.equal(f.client.trackPurchase(purchase()), true);
    assert.equal(f.client.trackPurchase(purchase(SECOND_TRANSACTION)), true);
    assert.equal(f.events().length, 2);
    const anotherProperty = fixture({
      storage: f.storage,
      measurementId: 'G-SYNTHETIC2',
    });
    anotherProperty.client.sdkReady();
    assert.equal(anotherProperty.client.trackPurchase(purchase()), true);
  });

  it('does not mark disabled or failed handoffs and can retry a synchronous SDK failure', () => {
    const disabled = fixture({ measurementId: '' });
    assert.equal(disabled.client.trackPurchase(purchase()), false);
    assert.equal(disabled.storage.size, 0);
    const f = fixture();
    f.client.sdkReady();
    f.setCommandThrows(true);
    assert.equal(f.client.trackPurchase(purchase()), false);
    assert.equal(f.storage.size, 0);
    f.setCommandThrows(false);
    assert.equal(f.client.trackPurchase(purchase()), true);
  });

  it('tolerates blocked/corrupt storage and maintains document-memory deduplication', () => {
    const f = fixture({ storageThrows: true });
    f.client.sdkReady();
    assert.equal(f.client.trackPurchase(purchase()), true);
    assert.equal(f.client.trackPurchase(purchase()), false);
    assert.equal(f.events().length, 1);
    const corrupt = fixture({
      storage: new Map([
        [`little-portions:ga4:purchases:${MEASUREMENT_ID}`, '{broken'],
      ]),
    });
    corrupt.client.sdkReady();
    assert.equal(corrupt.client.trackPurchase(purchase()), true);
  });

  it('rejects raw order IDs, invalid money/items and inconsistent item subtotal', () => {
    const f = fixture();
    f.client.sdkReady();
    const invalid = [
      { ...purchase(), transactionId: 'raw-order-123' },
      { ...purchase(), value: 5400 },
      { ...purchase(), shipping: -1 },
      { ...purchase(), currency: 'USD' },
      { ...purchase(), items: [] },
      {
        ...purchase(),
        items: [{ item_name: '양파', price: 1200, quantity: 0 }],
      },
      {
        ...purchase(),
        items: [{ item_name: 'person@example.com', price: 1200, quantity: 2 }],
      },
    ];
    for (const input of invalid) {
      assert.equal(f.client.trackPurchase(input as PurchaseEvent), false);
    }
    assert.equal(f.events().length, 0);
    assert.equal(f.storage.size, 0);
  });

  it('constructs purchase item payloads without raw extra fields', () => {
    const f = fixture();
    f.client.sdkReady();
    const input = {
      ...purchase(),
      user_id: 'private',
      paymentKey: 'private',
      items: [
        {
          item_id: 'onion',
          item_name: '양파',
          price: 1200,
          quantity: 2,
          email: 'private',
          answers: ['private'],
        },
      ],
    };
    assert.equal(f.client.trackPurchase(input), true);
    assert.deepEqual(f.events()[0].parameters.items, [
      { item_id: 'onion', item_name: '양파', price: 1200, quantity: 2 },
    ]);
    assert.doesNotMatch(
      JSON.stringify(f.calls),
      /private|paymentKey|user_id|answers/,
    );
  });
});
