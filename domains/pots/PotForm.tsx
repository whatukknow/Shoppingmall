'use client';

import { FormField } from '@/shared/components';

interface PotFormProps {
  productId: string;
  myPotPageHref: string;
}

export default function PotForm({
  productId,
  myPotPageHref,
}: PotFormProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3">
      <h2 className="text-2xl font-bold">맞는 팟이 없다면</h2>
      <div>
        <p>새 팟을 신청할 수 있어요.</p>
        <p>생성자가 신청을 취소해 도 팟 자체는 유지돼요.</p>
      </div>
      <FormField label="상품 및 소분량" />
      <FormField label="수령 정보" />
      <button
        className="border p-2"
        onClick={() => {
          // 새 팟 신청
        }}
      >
        새 팟 신청
      </button>
      <button
        className="border p-2"
        onClick={() => {
          // myPotPageHref 화면으로 이동
        }}
      >
        내 신청 팟 보기
      </button>
    </div>
  );
}
