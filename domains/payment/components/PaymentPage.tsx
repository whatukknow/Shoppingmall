// 결제 화면 큰 틀: 제목, 좌우배치, 폼 요약 조합 등을 관리
'use client';

import { useState, type FormEvent } from 'react';

import { Button } from '@/shared/components';
import DeliveryForm from './DeliveryForm';

import { validateDelivery } from '../data/payment.validation';
import type { DeliveryInfos, DeliveryErrors } from '../data/payment.types';

// 배송 정보 초기값
const initialDelivery: DeliveryInfos = {
  recipientName: '', // 처음에는 빈 문자열
  recipientPhone: '',
  postalCode: '',
  recipientAddress: '',
  recipientAddressDetail: '',
  saveAsDefaultAddress: false, // 처음에는 체크하지 않음
  entranceInstructions: '',
  deliveryRequest: '',
};

export default function PaymentPage() {
  // 1. 상태: 입력값과 오류 메시지
  const [delivery, setDelivery] = useState<DeliveryInfos>(initialDelivery);

  const [errors, setErrors] = useState<DeliveryErrors>({});

  // 2. 입력 처리: 변경된 이름 저장
  function handleRecipientNameChange(value: string) {
    setDelivery((previous) => ({
      ...previous,
      recipientName: value,
    }));
  }

  function handleRecipientPhoneChange(value: string) {
    const digits = value.replace(/\D/g, '').slice(0, 11);

    setDelivery((previous) => ({
      ...previous,
      recipientPhone: digits,
    }));
  }

  // 3. 제출 처리: 입력 검사 후 오류 표시
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const nextErrors = validateDelivery(delivery);
    setErrors(nextErrors);

    // 현재 구현된 이름 항목의 오류 확인
    if (nextErrors.recipientName) {
      document.getElementById('recipientName')?.focus();
    }

    // 다른 항목의 오류가 있어도 제출 중단
    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    // 검증 통과 후 결제 요청은 추후 연결
  }

  // 4. 화면 구성
  return (
    <main className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">선택한 팟의 주문 내용을 확인해요</h1>
        <p className="mt-2">배송 정보를 입력해 주세요.</p>
      </header>

      <form
        noValidate
        onSubmit={handleSubmit}
        className="grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]"
      >
        <DeliveryForm
          infos={delivery}
          errors={errors}
          onRecipientNameChange={handleRecipientNameChange}
          onRecipientPhoneChange={handleRecipientPhoneChange}
        />

        <aside className="flex flex-col gap-4 min-[1260px]:sticky min-[1260px]:top-24">
          <h2 className="text-xl font-bold">입력 확인</h2>

          <p className="text-sm">
            현재는 입력값만 확인하며 실제 결제는 진행되지 않습니다.
          </p>

          <Button type="submit" size="touch">
            입력값 확인하기
          </Button>
        </aside>
      </form>
    </main>
  );
}
