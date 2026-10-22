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
          결제 결과를 확인하고 있습니다.
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
  const failMessage =
    message ||
    '결제 완료 여부를 확인하지 못했습니다. 주문 상태를 확인해 주세요.';

  return (
    <>
      {/* 상품 목록을 불러오지 못해도 실패 안내는 표시합니다. */}
      <section
        aria-label="결제 오류 안내"
        className="mx-auto w-full max-w-[900px] px-6 pt-10"
      >
        <div role="alert" className="border border-current/15 p-5">
          <p className="font-semibold">결제 처리 안내</p>
          <p className="mt-2 text-sm break-words whitespace-pre-wrap">
            {failMessage}
          </p>
          {code && (
            <p className="text-muted-foreground mt-2 text-xs break-all">
              오류 코드: {code}
            </p>
          )}
          <Link href="/payment" className="mt-4 inline-block text-sm underline">
            주문 정보로 돌아가기
          </Link>
        </div>
      </section>

      <Suspense
        fallback={
          <p role="status" className="mx-auto w-full max-w-[900px] px-6 py-10">
            주문 정보를 불러오는 중입니다.
          </p>
        }
      >
        <FailureOrderContent />
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
        주문 목록을 불러오지 못했습니다. 잠시 후 다시 확인해 주세요.
      </p>
    );
  }

  // 로컬 PaymentResultPage에 이미 정의된 props만 전달합니다.
  return <PaymentResultPage status="failed" items={items} />;
}
