'use client'; // 로그아웃 클릭 처리를 하는 경계

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from '@/domains/auth/auth.api';
import { ProfileView } from '@/domains/auth/components/ProfileView';
import { AUTH_PREVIEW_SESSION_KEY } from '@/domains/auth/data/authPreviewSession';
import type { Member } from '@/domains/auth/auth.types';

type ProfileContainerProps = {
  member: Member;
  myPodsHref?: string;
  tasteHref?: string;
};

export default function ProfileContainer({
  member,
  myPodsHref,
  tasteHref,
}: ProfileContainerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // 비동기 대기 중 중복 클릭 차단

  // 로그아웃 버튼을 눌렀을 때
  const handleLogout = () => {
    startTransition(async () => {
      try {
        await signOut();

        // TODO(session): 세션 쿠키·캐시 삭제 — proxy.ts 와 함께 구현

        try {
          window.sessionStorage.removeItem(AUTH_PREVIEW_SESSION_KEY);
        } catch {
          // 브라우저 저장소를 사용할 수 없는 환경에서는 기존 로그인 이동만 진행
        }

        router.push('/login');
      } catch {
        // TODO: 로그아웃 실패 안내 UI
      }
    });
  };

  return (
    <ProfileView
      member={member}
      myPodsHref={myPodsHref}
      tasteHref={tasteHref}
      onLogout={handleLogout}
      isPending={isPending}
    />
  );
}
