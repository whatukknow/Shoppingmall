'use client';

import { useEffect, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import {
  analyticsMeasurementId,
  analyticsSdkFailed,
  analyticsSdkReady,
  initializeAnalytics,
  isAnalyticsInitialized,
  subscribeAnalyticsInitialization,
  trackPageView,
} from '@/shared/lib/analytics/client';

/** Invisible instrumentation; all app content remains in its existing hierarchy. */
export function AnalyticsProvider() {
  const pathname = usePathname();
  const measurementId = analyticsMeasurementId();
  const initialized = useSyncExternalStore(
    subscribeAnalyticsInitialization,
    isAnalyticsInitialized,
    () => false,
  );

  useEffect(() => {
    if (!initializeAnalytics()) return;
    trackPageView();
  }, [pathname]);

  if (!measurementId || !initialized) return null;

  return (
    <Script
      id="little-portions-ga4"
      src={`https://www.googletagmanager.com/gtag/js?id=${measurementId}`}
      strategy="afterInteractive"
      referrerPolicy="no-referrer"
      onReady={analyticsSdkReady}
      onError={analyticsSdkFailed}
    />
  );
}
