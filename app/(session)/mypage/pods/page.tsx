import type { Metadata } from 'next';
import { Suspense } from 'react';
import MyPodsContainer from '@/domains/pods/containers/MyPodsContainer';
import { isMyPodsTab } from '@/domains/pods/containers/MyPodsContainer';
import { MyPodsSkeleton } from '@/domains/pods/components/MyPodsSkeleton';

export const metadata: Metadata = {
  title: '내 신청 팟 | Little Portions',
};

type PageProps = {
  searchParams: Promise<{ tab?: string }>;
};

// 'use client' 없음: 내 신청 팟 컨테이너를 Suspense 로 감싸 스트리밍하는 페이지

export default function MyPodsPage({ searchParams }: PageProps) {
  return (
    <main className="mx-auto w-full max-w-[1080px] px-4 py-12 md:py-20">
      <Suspense fallback={<MyPodsSkeleton />}>
        <MyPodsParams searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function MyPodsParams({ searchParams }: PageProps) {
  const { tab } = await searchParams;
  return <MyPodsContainer tab={isMyPodsTab(tab)} />;
}
