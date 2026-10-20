'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasPreviewLoginSession } from '@/domains/auth/data/authPreviewSession';
import type { HomeProduct } from '../data/homeProducts';
import { HOME_RECOMMENDATIONS_KEY } from '../data/homeRecommendations';
import { matchOnboardingProducts } from '../data/onboardingSelection';

const routes = [
  '/onboarding',
  '/onboarding/sunday',
  '/onboarding/fridge',
  '/onboarding/result',
];

export function OriginalOnboardingFrame({
  products = [],
}: {
  products?: HomeProduct[];
}) {
  const frameRef = useRef<HTMLIFrameElement>(null);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const header = document.querySelector('header[aria-label="상점 헤더"]');
    const syncViewport = () => {
      const frame = frameRef.current;
      if (!frame) return;
      const rect = frame.getBoundingClientRect();
      const headerBottom = header?.getBoundingClientRect().bottom ?? 0;
      frame.contentWindow?.postMessage(
        {
          type: 'little-portions:onboarding-viewport',
          top: Math.max(0, headerBottom - rect.top),
          bottom: Math.max(0, rect.bottom - window.innerHeight),
        },
        '*',
      );
    };
    const observer = new ResizeObserver(syncViewport);
    if (header) observer.observe(header);
    if (frameRef.current) observer.observe(frameRef.current);
    window.addEventListener('scroll', syncViewport, { passive: true });
    window.addEventListener('resize', syncViewport);
    frameRef.current?.addEventListener('load', syncViewport);
    syncViewport();
    const frame = frameRef.current;
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', syncViewport);
      window.removeEventListener('resize', syncViewport);
      frame?.removeEventListener('load', syncViewport);
    };
  }, []);

  useEffect(() => {
    const syncRoute = () =>
      frameRef.current?.contentWindow?.postMessage(
        {
          type: 'little-portions:onboarding-route',
          step: routes.indexOf(pathname),
        },
        '*',
      );
    const handleMessage = (event: MessageEvent<unknown>) => {
      if (
        event.source !== frameRef.current?.contentWindow ||
        !event.data ||
        typeof event.data !== 'object'
      )
        return;
      const message = event.data as {
        type?: unknown;
        step?: unknown;
        productNames?: unknown;
      };
      if (message.type === 'little-portions:onboarding-ready') syncRoute();
      if (
        message.type === 'little-portions:onboarding-step' &&
        typeof message.step === 'number' &&
        routes[message.step]
      ) {
        if (routes[message.step] !== pathname)
          router.push(routes[message.step], { scroll: false });
      }
      if (message.type === 'little-portions:onboarding-complete') {
        const loggedIn = hasPreviewLoginSession();
        try {
          if (Array.isArray(message.productNames)) {
            const names = message.productNames.filter(
              (name): name is string => typeof name === 'string',
            );
            sessionStorage.setItem(
              HOME_RECOMMENDATIONS_KEY,
              JSON.stringify(matchOnboardingProducts(names, products)),
            );
          } else sessionStorage.removeItem(HOME_RECOMMENDATIONS_KEY);
          if (loggedIn) {
            sessionStorage.setItem('little-portions:onboarding-complete', 'yes');
            sessionStorage.removeItem('little-portions:onboarding-pending-login');
          } else {
            sessionStorage.setItem('little-portions:onboarding-pending-login', 'yes');
          }
        } catch {
          return;
        }
        router.push(loggedIn ? '/#share-products' : '/login?next=%2F%23share-products');
      }
    };
    window.addEventListener('message', handleMessage);
    syncRoute();
    return () => window.removeEventListener('message', handleMessage);
  }, [pathname, products, router]);

  return (
    <div
      aria-label="한 끼 사주 취향 찾기"
      className="flex min-h-[100svh] w-full items-stretch bg-[#fff8d6]"
    >
      <iframe
        ref={frameRef}
        title="한 끼 사주 온보딩"
        src="/onboarding/han-kki-saju-v1.html"
        sandbox="allow-scripts"
        className="block h-[100svh] w-full min-w-0 border-0"
      />
    </div>
  );
}
