import type { Member } from './auth.types';

// 로그인한 회원의 정보 가져오기
// TODO: 인증 API가 생기면 apiClient로 요청하도록 교체
// 지금은 시안 범위(구조 검토용)에 맞춰 예시 회원을 돌려줌
export async function getMyProfile(): Promise<Member> {
  return {
    name: '정은',
    email: 'jeongeun@example.com',
    deliveryInfo: undefined, // 기본 수령 정보 미등록
  };
}