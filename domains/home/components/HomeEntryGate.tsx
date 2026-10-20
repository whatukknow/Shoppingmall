'use client';

import { useEffect, useSyncExternalStore, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { OriginalOnboardingFrame } from './OriginalOnboardingFrame';

const ONBOARDING_KEY = 'little-portions:onboarding-complete';
const PENDING_LOGIN_KEY = 'little-portions:onboarding-pending-login';
const subscribeToSession = () => () => {};
const getServerSnapshot = () => false;
const getOnboardingSnapshot = () => {
  try {
    return window.sessionStorage.getItem(ONBOARDING_KEY) === 'yes';
  } catch {
    return false;
  }
};

/** 설문을 마치지 않은 방문자에게 온보딩 화면을 전체 화면으로 표시합니다. */
export function HomeEntryGate({ children }: { children: ReactNode }) {
  const router = useRouter();
  const ready = useSyncExternalStore(
    subscribeToSession,
    getOnboardingSnapshot,
    getServerSnapshot,
  );

  useEffect(() => {
    if (ready) return;
    const hasPendingLogin = window.sessionStorage.getItem(PENDING_LOGIN_KEY) === 'yes';
    if (hasPendingLogin) router.replace('/login?next=%2F%23share-products');
  }, [ready, router]);

  return (
    <>
      <div inert={!ready} aria-hidden={!ready}>
        {children}
      </div>
      {!ready && <OriginalOnboardingFrame />}
    </>
  );
}
