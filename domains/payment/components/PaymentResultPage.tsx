'use client';

import { useEffect } from 'react';
import { saveSelectedPodIds } from '@/domains/payment/data/payment.session';

import Link from 'next/link';

import PaymentOrderItems from './PaymentOrderItems';
import { useSelectedPodIds } from '@/shared/hooks/useSelectedPodIds';

import type { PaymentOrderItem } from '../data/payment.types';

type PaymentResultPageProps = {
  status: 'success' | 'failed';
  items: PaymentOrderItem[];
  orderItems?: PaymentOrderItem[];
  receiptUrl?: string | null;
  paidAmount?: number;
  orderShippingFee?: number;
};

export default function PaymentResultPage({
  status,
  items: allItems,
  orderItems,
  receiptUrl,
  paidAmount,
  orderShippingFee,
}: PaymentResultPageProps) {
  // 훅은 컴포넌트 함수 안에서 호출
  const selectedIds = useSelectedPodIds();
  const loaded = orderItems !== undefined || selectedIds !== null;

  // 저장된 ID에 해당하는 상품만 선택
  const items =
    orderItems ??
    allItems.filter((item) => selectedIds?.includes(item.podId) ?? false);

  useEffect(() => {
    if (status === 'success') saveSelectedPodIds([]); // 결제 완료 → 선택 비우기
  }, [status]);

  if (!loaded) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <p role="status">Loading your order.</p>
      </main>
    );
  }

  // 결과 주소로 직접 들어왔거나 임시 저장 정보가 없는 경우
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <h1 className="text-2xl font-bold">No order details to show.</h1>
        <Link href="/" className="mt-6 inline-block underline">
          Back to home
        </Link>
      </main>
    );
  }

  const isSuccess = status === 'success';

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  // 화면 확인용: 현재 결제 화면의 임시 금액과 동일
  const shippingFee = orderShippingFee ?? 3000;
  const discount = 0;
  const total = paidAmount ?? subtotal + shippingFee - discount;

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-12">
      <p className="mb-8 text-center text-sm">
        {isSuccess
          ? 'Your payment status has been confirmed.'
          : 'Payment has not been completed.'}
      </p>

      <header className="mb-12 text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-current/20 text-3xl"
        >
          {isSuccess ? '✓' : '!'}
        </span>

        <h1 className="text-3xl font-bold">
          {isSuccess ? 'Payment complete!' : 'Payment failed.'}
        </h1>

        <p className="mt-4 leading-7">
          {isSuccess
            ? 'Fresh ingredients, grown with care, are on their way to your table.'
            : 'Your selected groups are saved. Check your payment details and try again.'}
        </p>
      </header>
      <div className="flex flex-col gap-10">
        <PaymentOrderItems items={items} />

        <section
          aria-labelledby="result-amount-title"
          className="rounded-xl border border-current/15 bg-white/40 p-6"
        >
          <h2 id="result-amount-title" className="mb-6 text-2xl font-bold">
            {isSuccess ? 'Payment details' : 'Amount due'}
          </h2>

          <dl className="space-y-3">
            <div className="flex justify-between gap-4">
              <dt>Subtotal</dt>
              <dd>{subtotal.toLocaleString('en-US')} KRW</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Delivery fee</dt>
              <dd>{shippingFee.toLocaleString('en-US')} KRW</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>Discount</dt>
              <dd>-{discount.toLocaleString('en-US')} KRW</dd>
            </div>

            <div className="flex justify-between gap-4 border-t border-current/15 pt-4 text-xl font-bold">
              <dt>{isSuccess ? 'Total' : 'Total due'}</dt>
              <dd>{total.toLocaleString('en-US')} KRW</dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          {isSuccess && receiptUrl?.startsWith('https://') && (
            <a
              href={receiptUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex min-h-12 items-center justify-center border border-current/30 px-8 font-bold"
            >
              View receipt
            </a>
          )}
          {!isSuccess && (
            <Link
              href="/payment"
              className="flex min-h-12 items-center justify-center rounded-none bg-[#601025] px-8 font-bold text-white"
            >
              Try payment again
            </Link>
          )}

          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-none border border-current/30 px-8 font-bold"
          >
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
