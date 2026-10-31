import { apiClient } from '@/shared/lib/client';
import type { ApiResponse } from '@/shared/lib/api.types';
import { isSignupAttemptToken } from './auth.types';
import type {
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  SignUpRequest,
  SignUpResponse,
} from './auth.types';

// 로그인
// TODO: Supabase 전환 시 이 함수 내부만 교체
export async function signIn(
  body: SignInRequest,
): Promise<ApiResponse<SignInResponse>> {
  return apiClient.post<ApiResponse<SignInResponse>>('auth/signin', body);
}

// 로그아웃
// TODO: Supabase 전환 시 이 함수 내부만 교체
export async function signOut(): Promise<ApiResponse<SignOutResponse>> {
  return apiClient.post<ApiResponse<SignOutResponse>>('auth/signout');
}

// 회원가입
// TODO: Supabase 전환 시 이 함수 내부만 교체
export async function signUp(
  body: SignUpRequest,
): Promise<ApiResponse<SignUpResponse>> {
  return apiClient.post<ApiResponse<SignUpResponse>>('auth/signup', body);
}

const SIGNUP_ATTEMPT_SESSION_KEY = 'little-portions:signup-attempt';

/** 가입 후 같은 탭의 첫 인증 완료에만 쓰는 비개인 표식을 보관한다. */
export function storeSignupAttemptToken(value: unknown): boolean {
  try {
    if (!isSignupAttemptToken(value)) {
      window.sessionStorage.removeItem(SIGNUP_ATTEMPT_SESSION_KEY);
      return false;
    }
    window.sessionStorage.setItem(SIGNUP_ATTEMPT_SESSION_KEY, value);
    return window.sessionStorage.getItem(SIGNUP_ATTEMPT_SESSION_KEY) === value;
  } catch {
    return false;
  }
}

export function readSignupAttemptToken(): string | undefined {
  try {
    const value = window.sessionStorage.getItem(SIGNUP_ATTEMPT_SESSION_KEY);
    return isSignupAttemptToken(value) ? value : undefined;
  } catch {
    return undefined;
  }
}

/** 소비를 확인한 뒤에만 이벤트를 보내 저장소 장애 시 반복 집계를 막는다. */
export function consumeSignupAttemptToken(value: string): boolean {
  try {
    if (!isSignupAttemptToken(value) || readSignupAttemptToken() !== value)
      return false;
    window.sessionStorage.removeItem(SIGNUP_ATTEMPT_SESSION_KEY);
    return window.sessionStorage.getItem(SIGNUP_ATTEMPT_SESSION_KEY) === null;
  } catch {
    return false;
  }
}
