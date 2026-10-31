const STATIC_PATHS = new Set([
  '/',
  '/about',
  '/terms',
  '/privacy',
  '/login',
  '/signup',
  '/onboarding',
  '/onboarding/fridge',
  '/onboarding/sunday',
  '/onboarding/result',
  '/products',
  '/mypage',
  '/mypage/pods',
  '/pods/waiting',
  '/payment',
  '/payment/pay-completed',
  '/payment/pay-failed',
]);

export const ANALYTICS_PAGE_TITLE = 'Little Portions';

export function validMeasurementId(value: unknown): string | null {
  return typeof value === 'string' && /^G-[A-Z0-9]{6,20}$/.test(value)
    ? value
    : null;
}

/** Only known route shapes survive. Queries, fragments and dynamic IDs never do. */
export function safePathname(pathname: string): string {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  if (STATIC_PATHS.has(path)) return path;
  if (/^\/products\/[^/]+$/.test(path)) return '/products/item';
  if (/^\/pods\/product\/[^/]+$/.test(path)) return '/pods/product/item';
  if (/^\/pods\/completed\/[^/]+$/.test(path)) return '/pods/completed/item';
  return '/other';
}

export function safePageLocation(rawUrl: string): string {
  try {
    const url = new URL(rawUrl);
    if (!['https:', 'http:'].includes(url.protocol)) return '';
    return `${url.origin}${safePathname(url.pathname)}`;
  } catch {
    return '';
  }
}

/** Keep same-site route shapes; external referrers are reduced to their origin. */
export function safePageReferrer(rawUrl: string, pageUrl: string): string {
  try {
    const referrer = new URL(rawUrl);
    const page = new URL(pageUrl);
    if (!['https:', 'http:'].includes(referrer.protocol)) return '';
    return referrer.origin === page.origin
      ? `${referrer.origin}${safePathname(referrer.pathname)}`
      : `${referrer.origin}/`;
  } catch {
    return '';
  }
}

export function safeItemId(value: unknown): string | undefined {
  return typeof value === 'string' && /^[A-Za-z0-9_-]{1,100}$/.test(value)
    ? value
    : undefined;
}

/** Names must originate in catalog/order snapshots, never form fields. */
export function safeItemName(value: unknown): string | undefined {
  if (typeof value !== 'string') return undefined;
  const name = value.trim();
  if (
    !name ||
    name.length > 100 ||
    /[@%?&#=<>\r\n]|https?:|\b(?:bearer|token|email|paymentkey|orderid|userid)\b/i.test(
      name,
    )
  ) {
    return undefined;
  }
  return name;
}
