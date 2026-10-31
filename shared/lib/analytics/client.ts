'use client';

import {
  createAnalyticsClient,
  type AnalyticsHost,
  type PurchaseEvent,
  type RecommendationClick,
} from './runtime';
import { validMeasurementId } from './safety';

type AnalyticsWindow = Window & {
  dataLayer?: unknown[];
  gtag?: (...args: unknown[]) => void;
};

let client: ReturnType<typeof createAnalyticsClient> | undefined;
let initialized = false;
const initializationListeners = new Set<() => void>();

export function analyticsMeasurementId(): string | null {
  return validMeasurementId(process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID);
}

function browserHost(): AnalyticsHost | undefined {
  if (typeof window === 'undefined') return undefined;
  const browser = window as AnalyticsWindow;
  return {
    command: (...args) => {
      browser.dataLayer ??= [];
      browser.gtag ??= function () {
        // Google documents an Arguments command envelope, not a plain rest array.
        // https://developers.google.com/tag-platform/tag-manager/datalayer
        // eslint-disable-next-line prefer-rest-params
        browser.dataLayer?.push(arguments);
      };
      browser.gtag(...args);
    },
    location: () => browser.location.href,
    referrer: () => browser.document.referrer,
    storage: () => browser.localStorage,
  };
}

function analytics() {
  // Do not cache an SSR/no-window instance before browser hydration.
  if (typeof window === 'undefined') return createAnalyticsClient({});
  client ??= createAnalyticsClient({
    measurementId: process.env.NEXT_PUBLIC_GA4_MEASUREMENT_ID,
    debug: process.env.NEXT_PUBLIC_GA4_DEBUG === 'true',
    host: browserHost(),
  });
  return client;
}

export function initializeAnalytics(): boolean {
  const accepted = analytics().initialize();
  if (accepted && !initialized) {
    initialized = true;
    initializationListeners.forEach((listener) => listener());
  }
  return accepted;
}

export function isAnalyticsInitialized(): boolean {
  return initialized;
}

export function subscribeAnalyticsInitialization(listener: () => void) {
  initializationListeners.add(listener);
  return () => initializationListeners.delete(listener);
}

export function analyticsSdkReady(): void {
  analytics().sdkReady();
}

export function analyticsSdkFailed(): void {
  analytics().sdkFailed();
}

export function trackPageView(): boolean {
  return analytics().trackPageView();
}

export function trackSignUp(): boolean {
  return analytics().trackSignUp();
}

export function trackTasteProfileSaved(input: {
  recommendationCount: number;
}): boolean {
  return analytics().trackTasteProfileSaved(input);
}

export function trackRecommendationClick(input: RecommendationClick): boolean {
  return analytics().trackRecommendationClick(input);
}

export function trackPurchase(input: PurchaseEvent): boolean {
  return analytics().trackPurchase(input);
}
