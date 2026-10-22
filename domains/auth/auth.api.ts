import { apiClient } from '@/shared/lib/client';
import type { ApiResponse } from '@/shared/lib/api.types';
import type {
  Member,
  SignInRequest,
  SignInResponse,
  SignOutResponse,
  SignUpRequest,
  SignUpResponse,
} from './auth.types';

// 로그인한 회원의 정보 가져오기
// TODO(session): 세션(쿠키)의 사용자 기준으로 조회
// TODO: Supabase 전환 시 이 함수 내부만 교체
export async function getMyProfile(): Promise<Member> {
  return apiClient.get<Member>('auth/me');
}

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
