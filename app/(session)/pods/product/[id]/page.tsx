import { Suspense } from 'react';

import { PodListSkeleton } from '@/domains/pods/components/PodListSkeleton';
import PodCreateContainer from '@/domains/pods/containers/PodCreateContainer';
import PodListContainer from '@/domains/pods/containers/PodListContainer';
import PodProductHeaderContainer from '@/domains/pods/containers/PodProductHeaderContainer';

interface PotPageProps {
  params: Promise<{ id: string }>;
}

// params 는 Suspense 안에서 await 해 스트리밍 폴백을 제공합니다.
export default function PotPage({ params }: PotPageProps) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto w-full max-w-[1260px] px-6 py-10 text-[#242821]">
          <div className="grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
            <div className="flex min-w-0 flex-col gap-3">
              <div className="h-8 w-48 animate-pulse rounded bg-[#e0ded6]" />
              <div className="mt-1 h-5 w-56 animate-pulse rounded bg-[#e0ded6]" />
            </div>
          </div>
        </div>
      }
    >
      <PodPageParams params={params} />
    </Suspense>
  );
}

async function PodPageParams({
  params,
}: PotPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  return (
    <div className="mx-auto w-full max-w-[1260px] px-6 py-10 text-[#242821]">
      <div className="grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-3xl font-bold">함께할 팟을 골라요</h1>
          <Suspense
            fallback={
              <div className="h-5 w-56 animate-pulse rounded bg-[#e0ded6]" />
            }
          >
            <PodProductHeaderContainer productId={id} />
          </Suspense>
          <Suspense fallback={<PodListSkeleton />}>
            <PodListContainer productId={id} />
          </Suspense>
        </div>
        {/* 데스크톱에서는 위쪽 여백을 조절해 양쪽 제목의 아래선을 맞춥니다. */}
        <div className="min-w-0 min-[1260px]:sticky min-[1260px]:top-24 min-[1260px]:pt-1">
          <PodCreateContainer productId={id} />
        </div>
      </div>
    </div>
  );
}
