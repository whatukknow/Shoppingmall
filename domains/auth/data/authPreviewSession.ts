// 실제 인증 권한과 무관한 시안용 로그인 이동 상태입니다.
export const AUTH_PREVIEW_SESSION_KEY = 'little-portions:auth-preview-session';

export function hasPreviewLoginSession(): boolean {
  try {
    return sessionStorage.getItem(AUTH_PREVIEW_SESSION_KEY) === 'yes';
  } catch {
    return false;
  }
}
