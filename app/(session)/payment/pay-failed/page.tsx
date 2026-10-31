import { Suspense } from 'react';
import Link from 'next/link';

import PaymentResultPage from '@/domains/payment/components/PaymentResultPage';
import { getPaymentItems } from '@/domains/payment/payment.api';

type PageProps = {
  searchParams: Promise<{
    code?: string | string[];
    message?: string | string[];
  }>;
};

export default function Page({ searchParams }: PageProps) {
  return (
    <Suspense
      fallback={
        <p role="status" className="px-6 py-10">
          Checking your payment status.
        </p>
      }
    >
      <PaymentFailureContent searchParams={searchParams} />
    </Suspense>
  );
}

async function PaymentFailureContent({ searchParams }: PageProps) {
  const params = await searchParams;
  // 동일한 파라미터가 여러 번 전달된 경우에는 사용하지 않습니다.
  const code = typeof params.code === 'string' ? params.code.trim() : '';
  const message =
    typeof params.message === 'string' ? params.message.trim() : '';

  // URL의 문구는 안내용입니다. 주문의 실제 결제 상태를 변경하지 않습니다.
  const mayRetryPayment = [
    'PAY_PROCESS_CANCELED',
    'PAY_PROCESS_ABORTED',
    'USER_CANCEL',
  ].includes(code);
  const failMessage = mayRetryPayment
    ? message || 'Payment was canceled before completion.'
    : 'Payment status could not be verified. Do not make another payment. Check your order status or contact customer support.';

  return (
    <>
      {/* 상품 목록을 불러오지 못해도 실패 안내는 표시합니다. */}
      <section
        aria-label="Payment error details"
        className="mx-auto w-full max-w-[900px] px-6 pt-10"
      >
        <div role="alert" className="border border-current/15 p-5">
          <p className="font-semibold">Payment status</p>
          <p className="mt-2 text-sm break-words whitespace-pre-wrap">
            {failMessage}
          </p>
          {code && (
            <p className="text-muted-foreground mt-2 text-xs break-all">
              Error code: {code}
            </p>
          )}
          <Link
            href={mayRetryPayment ? '/payment' : '/mypage'}
            className="mt-4 inline-block text-sm underline"
          >
            {mayRetryPayment ? 'Back to order details' : 'Check order status'}
          </Link>
        </div>
      </section>

      <Suspense
        fallback={
          <p role="status" className="mx-auto w-full max-w-[900px] px-6 py-10">
            Loading your order.
          </p>
        }
      >
        {mayRetryPayment ? (
          <FailureOrderContent />
        ) : (
          <PaymentResultPage
            status="recovery"
            items={[]}
            orderItems={[]}
            recoveryMessage={failMessage}
            recoveryHref="/mypage"
          />
        )}
      </Suspense>
    </>
  );
}

async function FailureOrderContent() {
  let items: Awaited<ReturnType<typeof getPaymentItems>>;
  try {
    items = await getPaymentItems();
  } catch {
    return (
      <p className="mx-auto w-full max-w-[900px] px-6 py-10 text-sm">
        Could not load your orders. Please try again shortly.
      </p>
    );
  }

  // 로컬 PaymentResultPage에 이미 정의된 props만 전달합니다.
  return <PaymentResultPage status="failed" items={items} />;
}
