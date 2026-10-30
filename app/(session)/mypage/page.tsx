import type { Metadata } from 'next';
import { Suspense } from 'react';
import { ProfileSkeleton } from '@/domains/auth/components/ProfileSkeleton';
import MyProfileContainer from '@/domains/auth/containers/MyProfileContainer';

export const metadata: Metadata = {
  title: 'My account | Little Portions',
};

// 'use client' 없음: 회원 정보 컨테이너를 Suspense 로 감싸 스트리밍하는 페이지

export default function MyPage() {
  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-12 md:py-20">
      <Suspense fallback={<ProfileSkeleton />}>
        <MyProfileContainer />
      </Suspense>
    </main>
  );
}
