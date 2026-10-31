'use client';

import { useEffect, useRef, useState, type FormEvent } from 'react';

import { useSelectedPodIds } from '@/shared/hooks/useSelectedPodIds';

import DeliveryForm from '@/domains/payment/components/DeliveryForm';
import PaymentMethod from '@/domains/payment/components/PaymentMethod';
import PaymentOrderItems from '@/domains/payment/components/PaymentOrderItems';
import PaymentSummary from '@/domains/payment/components/PaymentSummary';

import { saveSelectedPodIds } from '@/domains/payment/data/payment.session';
import { validateDelivery } from '@/domains/payment/data/payment.validation';
import { createPendingOrderAction } from '@/domains/payment/payment.actions';
import {
  requestTossPayment,
  validateTossPaymentClientKey,
} from '@/domains/payment/pg-toss/requestTossPayment';

import type {
  DeliveryInfos,
  DeliveryErrors,
  PaymentMethods,
  PaymentErrors,
  PaymentOrderItem,
} from '@/domains/payment/data/payment.types';

type PaymentPageProps = {
  items: PaymentOrderItem[];
  initialDelivery?: DeliveryInfos; // 로그인 회원의 미리 채운 배송 정보
};

// 배송 정보 초기값 (미리 채운 값이 없으면 빈 값)
const emptyDelivery: DeliveryInfos = {
  recipientName: '',
  recipientPhone: '',
  postalCode: '',
  recipientAddress: '',
  recipientAddressDetail: '',
  entranceInstructions: '',
};

export default function PaymentPage({
  items,
  initialDelivery,
}: PaymentPageProps) {
  // 1. 입력값과 오류 상태
  const [delivery, setDelivery] = useState<DeliveryInfos>(
    initialDelivery ?? emptyDelivery,
  );
  const [errors, setErrors] = useState<DeliveryErrors>({});

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethods>('');
  const [privacyConsent, setPrivacyConsent] = useState(false);
  const [paymentErrors, setPaymentErrors] = useState<PaymentErrors>({});

  const [submitNotice, setSubmitNotice] = useState('');
  const [isPaying, setIsPaying] = useState(false); // 결제 버튼 중복 클릭 방지
  const paymentInFlight = useRef(false); // 같은 렌더 안에서 연속 submit도 차단
  const mounted = useRef(false);
  const paymentAbort = useRef<AbortController | null>(null);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      paymentAbort.current?.abort();
    };
  }, []);

  // 2. 저장된 팟 목록 확인
  const selectedIds = useSelectedPodIds();
  const orderLoaded = selectedIds !== null;

  // 선택한 팟이 없으면 결제 대상도 비워 둡니다.
  const orderItems =
    selectedIds === null
      ? []
      : items.filter((item) => selectedIds.includes(item.podId));

  // 3. 금액 계산 — 실제 연동 시 서버 계산 결과로 대체
  const subtotal = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  const shippingFee = orderItems.length > 0 ? 3000 : 0;
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

  // 6. 제출: 입력 검사 → 팟 저장 → 가주문 생성 → 토스 결제창 열기
  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    return beginCheckout(paymentMethod);
  }

  function handleTossPayCheckout() {
    if (paymentInFlight.current) return;
    handlePaymentMethodChange('tosspay');
    // state 반영을 기다리지 않고 클릭한 수단을 명시한다. 취소 후 재클릭도 실행된다.
    return beginCheckout('tosspay');
  }

  async function beginCheckout(selectedMethod: PaymentMethods) {
    if (!mounted.current || !orderLoaded || paymentInFlight.current) {
      return;
    }

    setSubmitNotice('');

    if (orderItems.length === 0) {
      setSubmitNotice('Please select your buying groups again.');
      return;
    }

    const nextErrors = validateDelivery(delivery);
    const nextPaymentErrors: PaymentErrors = {};

    if (!selectedMethod) {
      nextPaymentErrors.paymentMethod = 'Choose a payment method.';
    }

    if (!privacyConsent) {
      nextPaymentErrors.privacyConsent = 'Please accept the required consent.';
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
        'Could not save your selected groups. Check your browser storage settings.',
      );
      return;
    }

    // 결제 수단은 위에서 검사했으므로 빈 값이 아님
    if (!selectedMethod) {
      return;
    }

    paymentInFlight.current = true;
    paymentAbort.current?.abort();
    const controller = new AbortController();
    paymentAbort.current = controller;
    setIsPaying(true);

    try {
      // 기존 payment()용 ck 키나 미설정 키로 가주문을 먼저 만들지 않는다.
      validateTossPaymentClientKey();

      // (1) 서버에 가주문 생성 → orderId, 서버가 계산한 금액 받기
      const order = await createPendingOrderAction(
        orderItems.map((item) => item.podId),
        delivery,
      );

      if (!mounted.current || controller.signal.aborted) return;

      if (!order.success) {
        setSubmitNotice(order.message);
        return;
      }

      // (2) 토스 결제창 열기 → 성공/실패 시 토스가 해당 URL로 이동시킴
      // 창의 수단을 미리 선택하지 못하므로 실제 이벤트 수단과 라디오를 비교한다.
      // render 완료 후에도 취소/오류/페이지 이탈까지 await와 버튼 잠금을 유지한다.
      await requestTossPayment(
        {
          method: selectedMethod,
          orderId: order.orderId,
          orderName: order.orderName,
          amount: order.amount,
          customerName: delivery.recipientName.trim(),
          customerMobilePhone: delivery.recipientPhone,
        },
        { signal: controller.signal },
      );
    } catch (error) {
      if (!mounted.current || controller.signal.aborted) return;

      const code =
        typeof error === 'object' && error !== null && 'code' in error
          ? String(error.code)
          : '';

      setSubmitNotice(
        code === 'USER_CANCEL' || code === 'PAY_PROCESS_CANCELED'
          ? 'Payment was cancelled. Please try again.'
          : code === 'PAYMENT_METHOD_MISMATCH'
            ? 'Choose the same card or TossPay method in checkout as on this page.'
            : 'Could not open checkout. Please try again shortly.',
      );
    } finally {
      if (paymentAbort.current === controller) {
        paymentAbort.current = null;
        paymentInFlight.current = false;
        if (mounted.current) setIsPaying(false);
      }
    }
  }

  // 7. 화면 구성
  return (
    <main className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">Review your shared order</h1>
        <p className="mt-2">Enter your delivery details.</p>
      </header>

      {!orderLoaded ? (
        <p role="status">Loading your selected groups.</p>
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
              onEntranceInstructionsChange={handleEntranceInstructionsChange}
            />

            <PaymentMethod
              value={paymentMethod}
              error={paymentErrors.paymentMethod}
              onChange={handlePaymentMethodChange}
              onTossPay={handleTossPayCheckout}
              disabled={isPaying || orderItems.length === 0}
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
              isPaying={isPaying}
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
