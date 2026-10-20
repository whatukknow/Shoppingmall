'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

import PodProgress from '@/domains/pods/waiting/components/PodProgress';
import PodStatusCard from './PodStatusCard'; 
import PodApplicationSummary from './PodApplicationSummary';
import PodNotificationNotice from './PodNotificationNotice';

import { saveSelectedPodIds } from '@/domains/payment/data/payment.session';

export default function PodWaitingPage() {
  const router = useRouter();
  const [paymentError, setPaymentError] = useState('');

  // 시연용 상태: 'recruiting' 또는 'matched'
  // 실제 연동 시 서버에서 받은 상태로 대체
  const [status] = useState<'recruiting' | 'matched'>('matched');

  const isMatched = status === 'matched';

  function handlePayment() {
    if (!isMatched) {
      return;
    }

    setPaymentError('');

    // 시연용: 결제 목업의 블루베리 팟 ID
    const saved = saveSelectedPodIds(['pod-1']);

    if (!saved) {
      setPaymentError(
        '선택한 팟을 저장하지 못했어요. 다시 시도해 주세요.',
      );
      return;
    }

    router.push('/payment');
  }

  return (
    <main className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          {isMatched
            ? '함께 나눌 준비가 됐어요!'
            : '함께 나눌 이웃을 기다리고 있어요'}
        </h1>

        <p className="mt-2">
          {isMatched
            ? '모집이 완료됐어요. 주문 내용을 확인하고 결제해 주세요.'
            : '신청이 완료됐어요. 모집이 끝나면 결제할 수 있어요.'}
        </p>

        <p className="mt-2 text-xs">
          시연용 모집 현황입니다.
        </p>
      </header>

      <PodProgress status={status} />

      <div className="mt-8 grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <h2 className="mb-6 text-2xl font-bold">모집 현황</h2>

          <PodStatusCard
            productName="용인 블루베리"
            imageUrl="/uploads/images/home/products/illustration-blueberries.png"
            optionLabel="1팩 · 125g"
            currentCount={isMatched ? 4 : 3}
            targetCount={4}
            deadlineLabel="10월 21일 오후 6시 · 예시"
            status={status}
          />

          {!isMatched && (
            <div className="mt-4">
              <PodNotificationNotice />
            </div>
          )}
        </section>

        <aside className="min-[1260px]:sticky min-[1260px]:top-24">
          <h2 className="mb-6 text-2xl font-bold">내 신청 정보</h2>

          <PodApplicationSummary
            productName="용인 블루베리"
            optionLabel="1팩 · 125g"
            quantity={1}
            unitPrice={4900}
            status={status}
            onPayment={handlePayment}
          />

          {paymentError && (
            <p role="alert" className="mt-3 text-sm text-red-600">
              {paymentError}
            </p>
          )}
        </aside>
      </div>
    </main>
  );
}