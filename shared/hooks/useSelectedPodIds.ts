'use client';

import { useSyncExternalStore } from 'react';
import { readSelectedPodIds } from '@/domains/payment/data/payment.session';

// 저장된 선택 정보가 바뀌면 React에 알림
function subscribe(onChange: () => void) {
  window.addEventListener('payment-selection-change', onChange);
  window.addEventListener('storage', onChange);

  return () => {
    window.removeEventListener('payment-selection-change', onChange);
    window.removeEventListener('storage', onChange);
  };
}

// 같은 데이터는 같은 문자열로 반환
function getSnapshot(): string {
  return JSON.stringify(readSelectedPodIds());
}

// 서버에서는 브라우저 저장소를 읽지 않음
function getServerSnapshot(): null {
  return null;
}

export function useSelectedPodIds(): string[] | null {
  const snapshot = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot,
  );

  return snapshot === null ? null : JSON.parse(snapshot);
}
