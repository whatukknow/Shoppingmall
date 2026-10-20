// 로그인 후 돌아갈 주소(next) 다루기

// 쿼리의 next 값을 안전한 내부 주소로 바꾸기 (외부 주소면 홈)
export const getRedirectTo = (next?: string | string[]) => {
  const value = Array.isArray(next) ? next[0] : next;

  if (value && value.startsWith('/') && !value.startsWith('//')) {
    return value;
  }

  return '/';
};

// 주소 뒤에 next 붙이기 (돌아갈 곳이 홈이면 안 붙임)
export const withNext = (path: string, redirectTo: string) =>
  redirectTo === '/' ? path : `${path}?next=${encodeURIComponent(redirectTo)}`;
