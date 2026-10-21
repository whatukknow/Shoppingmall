'use client';

import Image from 'next/image';
import { Button } from '@/shared/components';

import type { PodListItem } from '@/domains/pods/pods.types';

export default function PotItem({
  potId,
  title,
  state,
  imageURL,
}: PodListItem): React.JSX.Element {
  return (
    <li
      className="flex min-w-0 flex-col gap-6 border-y border-[#e0ded6] p-5 sm:p-6"
      key={potId}
    >
      <div className="flex items-center gap-4">
        <Image
          src={imageURL}
          width={88}
          height={88}
          alt="상품 이미지"
          className="h-22 w-22 shrink-0 object-contain"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-[19px] leading-7 font-bold">{title}</h3>
          <p className="mt-1 text-xs leading-5 text-[#77766f]">{state}</p>
        </div>
      </div>
      <div className="border-t border-[#e0ded6] pt-4">
        <Button
          type="button"
          size="touch"
          className="w-full rounded-full bg-[#650f20] text-[13px] font-medium text-white hover:bg-[#650f20]/90"
          onClick={() => {
            // potId를 이용하여 참여 API 호출
          }}
        >
          이 팟에 참여
        </Button>
      </div>
    </li>
  );
}
