'use client';

import { EmptyState, NavigationAction, PotCard } from '@/shared/components';
import type { LivePod } from '../data/productDetail.types';

type LivePodSectionProps = {
  productId: string;

  // null: 데이터 연결 전
  // []: 조회는 완료했지만 결과가 없음
  pods: LivePod[] | null;
};

export default function LivePodSection({
  productId,
  pods,
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
          모집 중인 팟
        </h2>

        <NavigationAction label="전체 보기 →" target={{ href: listHref }} />
      </div>

      {pods === null ? (
        <EmptyState
          title="팟 정보 연결 준비 중"
          description="상품별 팟 목록이 연결되면 표시됩니다."
        />
      ) : recruitingPods.length === 0 ? (
        <EmptyState title="현재 모집 중인 팟이 없습니다." />
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
