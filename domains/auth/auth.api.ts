import type { Member } from './auth.types';

/** 목업 회원을 제거하고 조회 함수 형태만 유지합니다. TODO: 인증된 회원 조회를 연결합니다. */
export async function getMyProfile(): Promise<Member | null> {
  return null;
}
