import Image from 'next/image';

import PodApplyContainer from '@/domains/pods/containers/PodApplyContainer';
import type { Pod } from '@/domains/pods/pods.types';

// 'use client' 없음. 받은 팟 정보대로 그리기만 하고, 참여 버튼은 PodApplyContainer 가 담당
export default function PodItem({ pod }: { pod: Pod }): React.JSX.Element {
  const state =
    pod.status === 'open'
      ? `Open · ${pod.currentCount}/${pod.targetCount} members · ${pod.deadlineLabel}`
      : `Group full · ${pod.deadlineLabel}`;

  return (
    <li className="flex min-w-0 flex-col gap-6 border-y border-[#e0ded6] p-5 sm:p-6">
      <div className="flex items-center gap-4">
        <Image
          src={pod.imageUrl}
          width={88}
          height={88}
          alt="Product image"
          className="h-22 w-22 shrink-0 object-contain"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-[19px] leading-7 font-bold">
            {pod.productName} · {pod.optionLabel}
          </h3>
          <p className="mt-1 text-xs leading-5 text-[#77766f]">{state}</p>
        </div>
      </div>
      <div className="border-t border-[#e0ded6] pt-4">
        <PodApplyContainer pod={pod} />
      </div>
    </li>
  );
}
