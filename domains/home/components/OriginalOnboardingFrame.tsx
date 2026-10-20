'use client';

import { useEffect, useRef } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { hasPreviewLoginSession } from '@/domains/auth/data/authPreviewSession';
import type { HomeProduct } from '../data/homeProducts';
import { HOME_RECOMMENDATIONS_KEY } from '../data/homeRecommendations';
import { matchOnboardingProducts } from '../data/onboardingSelection';
import {
  createOnboardingScope,
  type OnboardingScope,
  type OnboardingMessage,
} from '../onboarding/onboardingScope';
import { startOriginalOnboarding } from '../onboarding/originalOnboardingRuntime';

const routes = [
  '/onboarding',
  '/onboarding/sunday',
  '/onboarding/fridge',
  '/onboarding/result',
];

export function OriginalOnboardingFrame({
  products = [],
  template,
}: {
  products?: HomeProduct[];
  template: string;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const scopeRef = useRef<OnboardingScope | null>(null);
  const router = useRouter();
  const pathname = usePathname();
  const pathnameRef = useRef(pathname);

  useEffect(() => {
    pathnameRef.current = pathname;
  }, [pathname]);

  useEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' });
    const parsed = new DOMParser().parseFromString(template, 'text/html');
    const surface = document.createElement('div');
    surface.className = 'onboarding-document';
    const hostStyle = document.createElement('style');
    hostStyle.textContent =
      ':host{all:initial;display:block;height:100svh;min-width:0;isolation:isolate;transform:translateZ(0)}.onboarding-document{position:relative;height:100%;overflow-y:auto}';
    root.replaceChildren(hostStyle, surface);
    parsed.querySelectorAll('style').forEach((style) => {
      const scoped = document.createElement('style');
      scoped.textContent = style.textContent
        .replace(/:root|\bhtml\b/g, '.onboarding-document')
        .replace(/\bbody\b/g, '.onboarding-body');
      root.appendChild(scoped);
      style.remove();
    });
    const fontLinks: Element[] = [];
    parsed.querySelectorAll('link[rel="stylesheet"]').forEach((link) => {
      const href = link.getAttribute('href');
      if (
        Array.from(document.head.querySelectorAll('link')).some(
          (existing) => existing.getAttribute('href') === href,
        )
      )
        return;
      const fontLink = link.cloneNode(true) as Element;
      document.head.appendChild(fontLink);
      fontLinks.push(fontLink);
    });
    parsed
      .querySelectorAll('link, meta, title, script')
      .forEach((element) => element.remove());
    const body = document.createElement('div');
    body.className = 'onboarding-body';
    body.innerHTML = parsed.body.innerHTML;
    surface.appendChild(body);
    const handleMessage = (message: OnboardingMessage) => {
      if (
        message.type === 'little-portions:onboarding-step' &&
        typeof message.step === 'number' &&
        routes[message.step]
      ) {
        if (routes[message.step] !== pathnameRef.current)
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
            sessionStorage.setItem(
              'little-portions:onboarding-complete',
              'yes',
            );
            sessionStorage.removeItem(
              'little-portions:onboarding-pending-login',
            );
          } else {
            sessionStorage.setItem(
              'little-portions:onboarding-pending-login',
              'yes',
            );
          }
        } catch {
          return;
        }
        router.push(
          loggedIn ? '/#share-products' : '/login?next=%2F%23share-products',
        );
      }
    };
    const scope = createOnboardingScope(root, surface, handleMessage);
    scopeRef.current = scope;
    startOriginalOnboarding(scope);
    scope.send({
      type: 'little-portions:onboarding-route',
      step: routes.indexOf(pathnameRef.current),
    });
    const header = document.querySelector('header[aria-label="상점 헤더"]');
    const syncViewport = () => {
      const rect = host.getBoundingClientRect();
      scope.send({
        type: 'little-portions:onboarding-viewport',
        top: Math.max(
          0,
          (header?.getBoundingClientRect().bottom ?? 0) - rect.top,
        ),
        bottom: Math.max(0, rect.bottom - window.innerHeight),
      });
    };
    const observer = new ResizeObserver(syncViewport);
    observer.observe(host);
    if (header) observer.observe(header);
    window.addEventListener('scroll', syncViewport, { passive: true });
    window.addEventListener('resize', syncViewport);
    syncViewport();
    return () => {
      observer.disconnect();
      window.removeEventListener('scroll', syncViewport);
      window.removeEventListener('resize', syncViewport);
      scope.dispose();
      fontLinks.forEach((link) => link.remove());
      scopeRef.current = null;
      root.replaceChildren();
    };
  }, [template, products, router]);

  useEffect(() => {
    scopeRef.current?.send({
      type: 'little-portions:onboarding-route',
      step: routes.indexOf(pathname),
    });
  }, [pathname]);

  return <div ref={hostRef} aria-label="한 끼 사주 취향 찾기" />;
}
