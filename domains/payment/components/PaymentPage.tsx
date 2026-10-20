'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';

import { useSelectedPodIds } from '@/shared/hooks/useSelectedPodIds';

import DeliveryForm from './DeliveryForm';
import PaymentMethod from './PaymentMethod';
import PaymentOrderItems from './PaymentOrderItems';
import PaymentSummary from './PaymentSummary';

import { saveSelectedPodIds } from '../data/payment.session';
import { validateDelivery } from '../data/payment.validation';

import type {
  DeliveryInfos,
  DeliveryErrors,
  PaymentMethods,
  PaymentErrors,
  PaymentOrderItem,
} from '../data/payment.types';

type PaymentPageProps = {
  items: PaymentOrderItem[];
};

// 배송 정보 초기값
const initialDelivery: DeliveryInfos = {
  recipientName: '',
  recipientPhone: '',
  postalCode: '',
  recipientAddress: '',
  recipientAddressDetail: '',
  saveAsDefaultAddress: false,
  entranceInstructions: '',
};

export default function PaymentPage({ items }: PaymentPageProps) {
  const router = useRouter();

  // 1. 입력값과 오류 상태
  const [delivery, setDelivery] = useState<DeliveryInfos>(initialDelivery);
  const [errors, setErrors] = useState<DeliveryErrors>({});

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethods>('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});

  const [submitNotice, setSubmitNotice] = useState('');

  // 2. 저장된 팟 목록 확인
  const selectedIds = useSelectedPodIds();
  const orderLoaded = selectedIds !== null;

  const orderItems = items.filter(
    (item) => selectedIds?.includes(item.podId) ?? false,
  );

  // 3. 금액 계산 — 실제 연동 시 서버 계산 결과로 대체
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const shippingFee = 0; // 배송비 연동 예정
  const discount = 0;

  // 4. 배송 정보 변경
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

  function handleAddressSelect(postalCode: string, address: string) {
    setDelivery((previous) => ({
      ...previous,
      postalCode,
      recipientAddress: address,
      recipientAddressDetail: '',
    }));

    setErrors((previous) => ({
      ...previous,
      recipientAddress: undefined,
      recipientAddressDetail: undefined,
    }));

    document.getElementById('recipientAddressDetail')?.focus();
  }

  function handleAddressDetailChange(value: string) {
    setDelivery((previous) => ({
      ...previous,
      recipientAddressDetail: value,
    }));
  }

  function handleSaveAsDefaultAddressChange(checked: boolean) {
    setDelivery((previous) => ({
      ...previous,
      saveAsDefaultAddress: checked,
    }));
  }

  function handleEntranceInstructionsChange(value: string) {
    setDelivery((previous) => ({
      ...previous,
      entranceInstructions: value,
    }));
  }

  // 5. 결제수단과 동의 변경
  function handlePaymentMethodChange(value: PaymentMethods) {
    setPaymentMethod(value);

    setPaymentErrors((previous) => ({
      ...previous,
      paymentMethod: undefined,
    }));
  }

  function handlePrivacyConsentChange(checked: boolean) {
    setPrivacyConsent(checked);

    if (checked) {
      setPaymentErrors((previous) => ({
        ...previous,
        privacyConsent: undefined,
      }));
    }
  }

  // 6. 제출: 입력 검사 → 팟 저장 → 테스트 결과 화면 이동
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitNotice('');

    if (!orderLoaded) {
      return;
    }

    if (orderItems.length === 0) {
      setSubmitNotice('결제할 팟을 다시 선택해 주세요.');
      return;
    }

    const nextErrors = validateDelivery(delivery);
    const nextPaymentErrors: PaymentErrors = {};

    if (!paymentMethod) {
      nextPaymentErrors.paymentMethod = '결제수단을 선택해 주세요.';
    }

    if (!privacyConsent) {
      nextPaymentErrors.privacyConsent = '필수 동의 항목을 확인해 주세요.';
    }

    setErrors(nextErrors);
    setPaymentErrors(nextPaymentErrors);

    // 첫 번째 오류 입력란 찾기
    let firstErrorId: string | undefined;

    if (nextErrors.recipientName) {
      firstErrorId = 'recipientName';
    } else if (nextErrors.recipientPhone) {
      firstErrorId = 'recipientPhone';
    } else if (nextErrors.recipientAddress) {
      firstErrorId = 'recipientAddress';
    } else if (nextErrors.recipientAddressDetail) {
      firstErrorId = 'recipientAddressDetail';
    } else if (nextErrors.entranceInstructions) {
      firstErrorId = 'entranceInstructions';
    } else if (nextPaymentErrors.paymentMethod) {
      firstErrorId = 'paymentMethod-card';
    } else if (nextPaymentErrors.privacyConsent) {
      firstErrorId = 'privacyConsent';
    }

    // 오류가 있으면 해당 입력란으로 이동하고 제출 중단
    if (
      Object.keys(nextErrors).length > 0 ||
      Object.keys(nextPaymentErrors).length > 0
    ) {
      if (firstErrorId) {
        document.getElementById(firstErrorId)?.focus();
      }

      return;
    }

    // 모든 검사를 통과한 경우에만 선택한 팟 저장
    const saved = saveSelectedPodIds(orderItems.map((item) => item.podId));

    if (!saved) {
      setSubmitNotice(
        '선택한 팟을 저장하지 못했어요. 브라우저 저장 설정을 확인해 주세요.',
      );
      return;
    }

    // 테스트용 이동: 실제 결제 요청은 추후 연결
    router.push('/payment/pay-completed');
  }

  // 7. 화면 구성
  return (
    <main className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">선택한 팟의 주문 내용을 확인해요</h1>
        <p className="mt-2">배송 정보를 입력해 주세요.</p>
      </header>

      {!orderLoaded ? (
        <p role="status">선택한 팟을 불러오는 중입니다.</p>
      ) : (
        <form
          noValidate
          onSubmit={handleSubmit}
          className="grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]"
        >
          <div className="flex min-w-0 flex-col gap-10">
            {orderItems.length > 0 && <PaymentOrderItems items={orderItems} />}

            <DeliveryForm
              infos={delivery}
              errors={errors}
              onRecipientNameChange={handleRecipientNameChange}
              onRecipientPhoneChange={handleRecipientPhoneChange}
              onAddressSelect={handleAddressSelect}
              onAddressDetailChange={handleAddressDetailChange}
              onSaveAsDefaultAddressChange={handleSaveAsDefaultAddressChange}
              onEntranceInstructionsChange={handleEntranceInstructionsChange}
            />

            <PaymentMethod
              value={paymentMethod}
              error={paymentErrors.paymentMethod}
              onChange={handlePaymentMethodChange}
            />
          </div>

          <aside className="min-[1260px]:sticky min-[1260px]:top-24">
            <PaymentSummary
              subtotal={subtotal}
              shippingFee={shippingFee}
              discount={discount}
              privacyConsent={privacyConsent}
              onPrivacyConsentChange={handlePrivacyConsentChange}
              privacyError={paymentErrors.privacyConsent}
              hasItems={orderItems.length > 0}
            />

            {submitNotice && (
              <p role="alert" className="mt-3 text-sm text-red-600">
                {submitNotice}
              </p>
            )}
          </aside>
        </form>
      )}
    </main>
  );
}
