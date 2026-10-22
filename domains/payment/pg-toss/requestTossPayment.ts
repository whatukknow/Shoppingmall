// 브라우저에서 토스 결제창 열기
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';

import type { PaymentMethods } from '@/domains/payment/data/payment.types';

type RequestTossPaymentInput = {
  method: Exclude<PaymentMethods, ''>;
  orderId: string;
  orderName: string;
  amount: number;
  customerName: string;
  customerMobilePhone: string;
};

export async function requestTossPayment(input: RequestTossPaymentInput) {
  const clientKey = process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY;

  if (!clientKey) {
    throw new Error('.env.local 에 NEXT_PUBLIC_TOSS_CLIENT_KEY 가 없습니다.');
  }

  const tossPayments = await loadTossPayments(clientKey);
  const payment = tossPayments.payment({ customerKey: ANONYMOUS });

  const origin = window.location.origin;

  await payment.requestPayment({
    method: 'CARD',
    amount: { currency: 'KRW', value: input.amount },
    orderId: input.orderId,
    orderName: input.orderName,
    successUrl: `${origin}/payment/pay-completed`, // ?paymentKey&orderId&amount 가 붙어서 돌아옴
    failUrl: `${origin}/payment/pay-failed`, // ?code&message&orderId 가 붙어서 돌아옴
    customerName: input.customerName,
    customerMobilePhone: input.customerMobilePhone,
    card:
      input.method === 'tosspay'
        ? { flowMode: 'DIRECT', easyPay: 'TOSSPAY' } // 토스페이 바로 열기
        : { flowMode: 'DEFAULT', useEscrow: false }, // 일반 카드 결제창
  });
}
