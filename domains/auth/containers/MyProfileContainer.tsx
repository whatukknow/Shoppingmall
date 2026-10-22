// 'use client' 없음: 서버에서 회원 정보를 조회하는 경계

import { redirect } from 'next/navigation';
import { withNext } from '@/domains/auth/auth.redirect';
import { getMyProfile } from '@/domains/auth/auth.api';
import ProfileContainer from '@/domains/auth/containers/ProfileContainer';

export default async function MyProfileContainer() {
  const member = await getMyProfile();

  // 로그인 안 한 상태면 로그인 후 마이페이지로 돌아오게
  // (지금은 예시 회원이 항상 와서 실행 안 됨. 인증 API 연결 후 동작)
  if (!member) redirect(withNext('/login', '/mypage'));

  return (
    <ProfileContainer
      member={member}
      // 다른 담당자 화면 주소가 정해지면 넣기
      // myPodsHref="/my-pods"   ← 상돈님 내 신청 팟 목록
      // tasteHref="/taste"      ← 서인님 AI 추천 취향
    />
  );
}
