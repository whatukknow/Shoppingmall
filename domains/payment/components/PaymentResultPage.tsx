'use client';

import Link from 'next/link';

import PaymentOrderItems from './PaymentOrderItems';
import { useSelectedPodIds } from '@/shared/hooks/useSelectedPodIds';

import type { PaymentOrderItem } from '../data/payment.types';

type PaymentResultPageProps = {
  status: 'success' | 'failed';
  items: PaymentOrderItem[];
};

export default function PaymentResultPage({
  status,
  items: allItems,
}: PaymentResultPageProps) {
  // 훅은 컴포넌트 함수 안에서 호출
  const selectedIds = useSelectedPodIds();
  const loaded = selectedIds !== null;

  // 저장된 ID에 해당하는 상품만 선택
  const items = allItems.filter(
    (item) => selectedIds?.includes(item.podId) ?? false,
  );

  if (!loaded) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <p role="status">주문 정보를 불러오는 중입니다.</p>
      </main>
    );
  }

  // 결과 주소로 직접 들어왔거나 임시 저장 정보가 없는 경우
  if (items.length === 0) {
    return (
      <main className="mx-auto max-w-[900px] px-6 py-16">
        <h1 className="text-2xl font-bold">확인할 주문 정보가 없어요.</h1>
        <Link href="/" className="mt-6 inline-block underline">
          홈으로 돌아가기
        </Link>
      </main>
    );
  }

  const isSuccess = status === 'success';

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );

  // 배송비 연동 예정
  const shippingFee = 0;
  const discount = 0;
  const total = subtotal + shippingFee - discount;

  return (
    <main className="mx-auto w-full max-w-[900px] px-6 py-12">
      <p className="mb-8 text-center text-sm">
        테스트 화면 · 실제 결제 결과가 아닙니다.
      </p>

      <header className="mb-12 text-center">
        <span
          aria-hidden="true"
          className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full border border-current/20 text-3xl"
        >
          {isSuccess ? '✓' : '!'}
        </span>

        <h1 className="text-3xl font-bold">
          {isSuccess ? '결제를 완료했어요!' : '결제에 실패했어요.'}
        </h1>

        <p className="mt-4 leading-7">
          {isSuccess
            ? '농부의 정성이 담긴 작은 결실이 곧 집 앞으로 찾아갑니다.'
            : '선택한 팟은 그대로 보관했어요. 결제 정보를 확인하고 다시 시도해 주세요.'}
        </p>
      </header>
      <div className="flex flex-col gap-10">
        <PaymentOrderItems items={items} />

        <section
          aria-labelledby="result-amount-title"
          className="rounded-xl border border-current/15 bg-white/40 p-6"
        >
          <h2 id="result-amount-title" className="mb-6 text-2xl font-bold">
            {isSuccess ? '결제 내역' : '결제 예정 금액'}
          </h2>

          <dl className="space-y-3">
            <div className="flex justify-between gap-4">
              <dt>상품 금액</dt>
              <dd>{subtotal.toLocaleString('ko-KR')}원</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>배송비</dt>
              <dd>{shippingFee.toLocaleString('ko-KR')}원</dd>
            </div>

            <div className="flex justify-between gap-4">
              <dt>할인 금액</dt>
              <dd>-{discount.toLocaleString('ko-KR')}원</dd>
            </div>

            <div className="flex justify-between gap-4 border-t border-current/15 pt-4 text-xl font-bold">
              <dt>{isSuccess ? '총 결제 금액' : '총 결제 예정 금액'}</dt>
              <dd>{total.toLocaleString('ko-KR')}원</dd>
            </div>
          </dl>
        </section>

        <div className="flex flex-wrap justify-center gap-3">
          {!isSuccess && (
            <Link
              href="/payment"
              className="flex min-h-12 items-center justify-center rounded-lg bg-[#601025] px-8 font-bold text-white"
            >
              다시 결제하기
            </Link>
          )}

          <Link
            href="/"
            className="flex min-h-12 items-center justify-center rounded-lg border border-current/30 px-8 font-bold"
          >
            홈으로 돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
