// 목업 응답 지연 (밀리초). 값을 바꿔 응답 지연·로딩 처리를 테스트한다.
export const MOCK_RESPONSE_DELAY_MS = 0;

// 지정한 시간(밀리초)만큼 기다린다. 0 이하이면 즉시 끝난다.
export function waitMockDelay(
  ms: number = MOCK_RESPONSE_DELAY_MS,
): Promise<void> {
  if (ms <= 0) return Promise.resolve();
  return new Promise((resolve) => setTimeout(resolve, ms));
}
