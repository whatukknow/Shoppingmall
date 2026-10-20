import type { Member } from '../auth.types';

// 시안 범위(구조 검토용) 예시 회원
export const myProfileMock: Member = {
  name: '정은',
  email: 'jeongeun@example.com',
  deliveryInfo: undefined, // 기본 수령 정보 미등록
};
