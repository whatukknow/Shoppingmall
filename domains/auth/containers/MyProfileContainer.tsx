// 'use client' 없음: 서버에서 회원 정보를 조회하는 경계

import { redirect } from 'next/navigation';
import { withNext } from '@/domains/auth/auth.redirect';
import { ApiError } from '@/shared/lib/client';
import { getMe } from '@/domains/auth/users.api';
import ProfileContainer from '@/domains/auth/containers/ProfileContainer';

export default async function MyProfileContainer() {
  // 로그인 안 한 상태(401)면 로그인 후 마이페이지로 돌아오게
  const user = await getMe().catch((error) => {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  });

  if (!user) redirect(withNext('/login', '/mypage'));

  return <ProfileContainer member={user} myPodsHref="/mypage/pods" />;
}
