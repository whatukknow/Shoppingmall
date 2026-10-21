'use client';

import { useState } from 'react';
import type { PodIdentity, PodCreateValues } from '@/domains/pods/pods.types';
import { Button, FormField } from '@/shared/components';

interface PotFormProps extends PodIdentity {
  myPotPageHref: string;
}

export default function PotForm({
  productId,
  myPotPageHref,
}: PotFormProps): React.JSX.Element {
  const [values, setValues] = useState<PodCreateValues>({
    targetCount: '',
    deadline: '',
  });

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">맞는 팟이 없다면</h2>
      {/* 데스크톱에서는 왼쪽 상품 안내 높이만큼 띄워 두 카드의 상단을 맞춥니다. */}
      <div className="flex flex-col gap-5 border-y border-[#e0ded6] p-5 min-[1260px]:mt-11 sm:p-6">
        <div className="text-[13px] leading-6 text-[#77766f]">
          <p>새 팟을 신청할 수 있어요.</p>
          <p>생성자가 신청을 취소해 도 팟 자체는 유지돼요.</p>
        </div>
        <FormField
          label="목표 인원"
          value={values.targetCount}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              targetCount: event.target.value,
            }))
          }
        />
        <FormField
          label="마감 기한"
          value={values.deadline}
          onChange={(event) =>
            setValues((current) => ({
              ...current,
              deadline: event.target.value,
            }))
          }
        />
        <Button
          type="button"
          size="touch"
          className="w-full rounded-none bg-[#650f20] text-[13px] font-medium text-white hover:bg-[#650f20]/90"
          onClick={() => {
            // 새 팟 신청
          }}
        >
          새 팟 신청
        </Button>
        <Button
          type="button"
          size="touch"
          variant="actionOutline"
          className="w-full rounded-none border-[#650f20] bg-transparent text-[13px] text-[#650f20]"
          onClick={() => {
            // myPotPageHref 화면으로 이동
          }}
        >
          내 신청 팟 보기
        </Button>
      </div>
    </div>
  );
}
