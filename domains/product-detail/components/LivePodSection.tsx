'use client';

import { EmptyState, NavigationAction, PotCard } from '@/shared/components';
import type { LivePod } from '../data/productDetail.types';

type LivePodSectionProps = {
  productId: string;
  allowBrowse?: boolean;

  // null: 데이터 연결 전
  // []: 조회는 완료했지만 결과가 없음
  pods: LivePod[] | null;
};

export default function LivePodSection({
  productId,
  pods,
  allowBrowse = true,
}: LivePodSectionProps) {
  const listHref = `/pods/product/${encodeURIComponent(productId)}`;

  const recruitingPods =
    pods?.filter((pod) => pod.status === 'recruiting') ?? [];

  return (
    <section
      id="live-pods"
      aria-labelledby="live-pods-heading"
      className="scroll-mt-24 space-y-6"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 id="live-pods-heading" className="text-2xl font-bold">
          Open buying groups
        </h2>

        {allowBrowse && (
          <NavigationAction label="View all →" target={{ href: listHref }} />
        )}
      </div>

      {!allowBrowse ? (
        <EmptyState title="Buying groups will open once this product is ready." />
      ) : pods === null ? (
        <EmptyState
          title="Group details coming soon"
          description="Buying groups will appear here when available."
        />
      ) : recruitingPods.length === 0 ? (
        <EmptyState title="No open buying groups right now." />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {recruitingPods.map((pod) => (
            <PotCard
              key={pod.id}
              title={pod.title}
              cropName={pod.cropName}
              description={pod.description}
              status={pod.status}
              applicantCount={pod.applicantCount}
              capacity={pod.capacity}
              href={listHref}
            />
          ))}
        </div>
      )}
    </section>
  );
}
