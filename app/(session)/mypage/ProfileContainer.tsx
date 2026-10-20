'use client'; // 로그아웃 클릭 처리를 하는 경계

import { useRouter } from 'next/navigation';
import { ProfileView } from '@/domains/auth/components/ProfileView';
import type { Member } from '@/domains/auth/auth.types';

type ProfileContainerProps = {
  member: Member | null;
  myPodsHref?: string;
  tasteHref?: string;
};

export default function ProfileContainer({
  member,
  myPodsHref,
  tasteHref,
}: ProfileContainerProps) {
  const router = useRouter();

  // 로그아웃 버튼을 눌렀을 때
  const handleLogout = () => {
    // TODO: 인증 API가 생기면 여기서 로그인 상태 지우기
    // 지금은 시안대로 로그인 화면으로 이동만 함
    router.push('/login');
  };

  return (
    <ProfileView
      member={member}
      myPodsHref={myPodsHref}
      tasteHref={tasteHref}
      onLogout={handleLogout}
    />
  );
}
