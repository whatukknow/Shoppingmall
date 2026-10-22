import { Suspense } from 'react';

import PodWaitingContainer from '@/domains/pods/containers/PodWaitingContainer';
import { PodWaitingSkeleton } from '@/domains/pods/waiting/components/PodWaitingSkeleton';

type PageProps = {
  searchParams: Promise<{ id?: string }>;
};

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense fallback={<PodWaitingSkeleton />}>
      <PodWaitingSearchParams searchParams={searchParams} />
    </Suspense>
  );
}

async function PodWaitingSearchParams({ searchParams }: PageProps) {
  const { id } = await searchParams;
  return <PodWaitingContainer selectedId={id} />;
}
