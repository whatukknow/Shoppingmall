'use client'; // 결제할 팟 저장과 이동을 하는 경계

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { saveSelectedPodIds } from '@/domains/payment/data/payment.session';

type MyPodPayContainerProps = {
  podId: string;
  label?: string;
};

// 결제하기 주 버튼 — MyPodCard 의 primary 링크 버튼과 같은 클래스
export default function MyPodPayContainer({
  podId,
  label = 'Pay now',
}: MyPodPayContainerProps) {
  const router = useRouter();
  const [error, setError] = useState('');

  const handlePay = () => {
    // 결제 페이지는 저장된 팟 id 로 주문 상품을 고른다
    if (!saveSelectedPodIds([podId])) {
      setError('Could not save your selected groups. Please try again.');
      return;
    }
    router.push('/payment');
  };

  return (
    <>
      <button
        type="button"
        onClick={handlePay}
        className="bg-primary text-primary-foreground border-primary hover:bg-primary/80 flex min-h-12 w-full items-center justify-center border px-4 text-sm font-medium"
      >
        {label}
      </button>
      {error && (
        <p role="alert" className="text-sm text-red-600">
          {error}
        </p>
      )}
    </>
  );
}
