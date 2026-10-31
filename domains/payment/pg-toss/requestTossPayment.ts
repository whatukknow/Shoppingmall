// 브라우저에서 토스 결제창형 결제를 시작한다.
import { ANONYMOUS, loadTossPayments } from '@tosspayments/tosspayments-sdk';

import {
  createTossPaymentWindowController,
  validateWidgetClientKey,
  type TossPaymentWindowInput,
} from '@/domains/payment/pg-toss/tossPaymentWindow';

const paymentWindow = createTossPaymentWindowController({
  loadSdk: loadTossPayments,
  customerKey: ANONYMOUS,
  getOrigin: () => window.location.origin,
});

// 가주문을 만들기 전에도 호출한다. 기존 payment()용 ck 키로는 창을 열지 않는다.
export function validateTossPaymentClientKey() {
  return validateWidgetClientKey(process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY);
}

export function requestTossPayment(
  input: TossPaymentWindowInput,
  options: { signal: AbortSignal },
) {
  return paymentWindow.request(
    input,
    validateTossPaymentClientKey(),
    options.signal,
  );
}
