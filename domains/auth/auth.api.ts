import { apiClient } from '@/shared/lib/client';
import type { Member } from './auth.types';

// 로그인한 회원의 정보 가져오기
// TODO: Supabase 전환 시 이 함수 내부만 교체
export async function getMyProfile(): Promise<Member> {
  return apiClient.get<Member>('auth/me');
}
