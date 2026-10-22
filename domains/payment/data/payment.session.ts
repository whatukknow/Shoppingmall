const STORAGE_KEY = 'payment:selected-pod-ids';

// 선택한 팟 ID 저장
export function saveSelectedPodIds(ids: string[]): boolean {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(ids));

    // 같은 탭에서도 변경 내용을 화면에 반영
    window.dispatchEvent(new Event('payment-selection-change'));

    return true;
  } catch {
    return false;
  }
}

// 저장된 팟 ID 읽기
export function readSelectedPodIds(): string[] {
  try {
    const stored = sessionStorage.getItem(STORAGE_KEY);

    if (!stored) {
      return [];
    }

    const parsed: unknown = JSON.parse(stored);

    if (!Array.isArray(parsed)) {
      return [];
    }

    if (!parsed.every((id) => typeof id === 'string')) {
      return [];
    }

    return parsed;
  } catch {
    return [];
  }
}
