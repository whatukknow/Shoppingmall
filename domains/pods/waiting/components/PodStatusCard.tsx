import { foodLabel } from '@/shared/lib/food-label';
// 팟의 모집 현황
import Image from 'next/image';

import type { PodRecruitment } from '@/domains/pods/pods.types';

type PodStatusCardProps = PodRecruitment;

export default function PodStatusCard({
  productName,
  imageUrl,
  optionLabel,
  currentCount,
  targetCount,
  deadlineLabel,
  status,
}: PodStatusCardProps) {
  const isMatched = status === 'matched';

  const remainingCount = Math.max(targetCount - currentCount, 0);

  const progress =
    targetCount > 0
      ? Math.min(Math.max((currentCount / targetCount) * 100, 0), 100)
      : 0;

  return (
    <div className="rounded-2xl border border-current/15 bg-white/30 p-5 sm:p-6">
      {/* 상품 정보 */}
      <div className="flex items-center gap-4">
        <Image
          src={imageUrl}
          alt={foodLabel(productName)}
          width={88}
          height={88}
          className="h-22 w-22 shrink-0 rounded-xl bg-white/50 object-cover"
        />

        <div className="min-w-0">
          <span className="inline-block rounded-full bg-[#601025]/10 px-3 py-1 text-xs font-bold">
            {isMatched ? 'Group full' : 'Open'}
          </span>

          <h3 className="mt-2 text-xl font-bold">{foodLabel(productName)}</h3>

          <p className="mt-1 text-sm">{optionLabel}</p>
        </div>
      </div>

      {/* 모집 현황 */}
      <div className="mt-8">
        <div className="flex items-center justify-between gap-4">
          <p className="font-bold">Group members</p>

          <p>
            <span className="text-xl font-bold">{currentCount}</span>
            <span> / {targetCount} members</span>
          </p>
        </div>

        {/* 진행 막대의 전체 틀 */}
        <div
          role="progressbar"
          aria-label="Group progress"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={progress}
          aria-valuetext={`${currentCount} of ${targetCount} members joined`}
          className="mt-3 h-3 overflow-hidden rounded-full bg-[#601025]/10"
        >
          {/* 진행률만큼 채워지는 막대 */}
          <div
            className="h-full rounded-full bg-[#601025]"
            style={{ width: `${progress}%` }}
          />
        </div>

        <p className="mt-4 text-lg font-bold">
          {isMatched
            ? 'Your group is ready!'
            : remainingCount > 0
              ? `${remainingCount} more members needed to fill the group.`
              : 'Checking group status.'}
        </p>

        <p className="mt-2 text-sm">
          {isMatched
            ? 'Review your order and complete payment.'
            : 'You’re in! Waiting for others to join your group.'}
        </p>
      </div>

      {/* 모집 마감 */}
      <div className="mt-6 flex flex-wrap justify-between gap-2 border-t border-current/15 pt-4 text-sm">
        <span>Recruitment deadline</span>
        <span className="font-medium">{deadlineLabel}</span>
      </div>
    </div>
  );
}
