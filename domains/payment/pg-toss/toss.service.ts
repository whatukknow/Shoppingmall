// 토스페이먼츠 서버 전용 유틸 (시크릿 키 사용 → 클라이언트에서 import 금지)

const TOSS_CONFIRM_URL = 'https://api.tosspayments.com/v1/payments/confirm';

export type ConfirmPaymentInput = {
  paymentKey: string;
  orderId: string;
  amount: number;
};

// 토스 승인 API 응답 중 우리가 쓰는 값만 정의
export type TossConfirmResponse = {
  paymentKey: string;
  orderId: string;
  status: string; // 'DONE' 이면 결제 완료
  method: string;
  totalAmount: number;
  approvedAt: string;
  receipt?: { url: string } | null;
};

// 시크릿 키를 "Basic base64(secretKey:)" 형식으로 변환
export function encodeTossBasicAuth(secretKey: string): string {
  return `Basic ${Buffer.from(`${secretKey}:`).toString('base64')}`;
}

// 주문명: "용인 블루베리 외 1건"
export function formatOrderName(productNames: string[]): string {
  if (productNames.length === 0) return 'Order items';
  if (productNames.length === 1) return productNames[0];
  return `${productNames[0]} 외 ${productNames.length - 1}건`;
}

export type TossPaymentResult =
  | { ok: true; data: TossConfirmResponse }
  | { ok: false; code: string; message: string; recoveryRequired: true };

export type TossLookupResult =
  | { state: 'found'; data: TossConfirmResponse }
  | { state: 'not-found' }
  | { state: 'uncertain'; code: string; message: string };

const STATUS_CHECK_MESSAGE =
  'Payment status could not be verified. Check this payment again before making another payment. If the issue continues, contact customer support.';

function isPaymentResponse(value: unknown): value is TossConfirmResponse {
  if (!value || typeof value !== 'object') return false;
  const payment = value as Partial<TossConfirmResponse>;
  return (
    typeof payment.status === 'string' &&
    typeof payment.orderId === 'string' &&
    typeof payment.paymentKey === 'string' &&
    Number.isSafeInteger(payment.totalAmount) &&
    (payment.totalAmount ?? 0) > 0
  );
}

/** Only the paymentKey lookup is supported with NEW gsk payment-window keys. */
export async function requestTossPaymentLookup(
  paymentKey: string,
): Promise<TossLookupResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return {
      state: 'uncertain',
      code: 'MISSING_SECRET_KEY',
      message: STATUS_CHECK_MESSAGE,
    };
  }
  try {
    const response = await fetch(
      `https://api.tosspayments.com/v1/payments/${encodeURIComponent(paymentKey)}`,
      {
        method: 'GET',
        headers: { Authorization: encodeTossBasicAuth(secretKey) },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      },
    );
    const json: unknown = await response.json();
    if (
      response.status === 404 &&
      json &&
      typeof json === 'object' &&
      'code' in json &&
      json.code === 'NOT_FOUND_PAYMENT'
    ) {
      return { state: 'not-found' };
    }
    if (!response.ok || !isPaymentResponse(json)) {
      return {
        state: 'uncertain',
        code: 'TOSS_LOOKUP_UNAVAILABLE',
        message: STATUS_CHECK_MESSAGE,
      };
    }
    return { state: 'found', data: json };
  } catch {
    return {
      state: 'uncertain',
      code: 'TOSS_LOOKUP_UNAVAILABLE',
      message: STATUS_CHECK_MESSAGE,
    };
  }
}

// A timeout, malformed response, or provider error cannot prove non-payment.
export async function requestTossPaymentConfirm(
  input: ConfirmPaymentInput,
): Promise<TossPaymentResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return {
      ok: false,
      code: 'MISSING_SECRET_KEY',
      message: STATUS_CHECK_MESSAGE,
      recoveryRequired: true,
    };
  }
  try {
    const response = await fetch(TOSS_CONFIRM_URL, {
      method: 'POST',
      headers: {
        Authorization: encodeTossBasicAuth(secretKey),
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(input),
      cache: 'no-store',
      signal: AbortSignal.timeout(15000),
    });
    const json: unknown = await response.json();
    if (!response.ok) {
      return {
        ok: false,
        code: 'TOSS_CONFIRM_UNAVAILABLE',
        message: STATUS_CHECK_MESSAGE,
        recoveryRequired: true,
      };
    }
    if (!isPaymentResponse(json)) {
      return {
        ok: false,
        code: 'INVALID_RESPONSE',
        message: STATUS_CHECK_MESSAGE,
        recoveryRequired: true,
      };
    }
    return { ok: true, data: json };
  } catch {
    return {
      ok: false,
      code: 'CONFIRM_UNAVAILABLE',
      message: STATUS_CHECK_MESSAGE,
      recoveryRequired: true,
    };
  }
}

/** Bind authoritative provider details to the callback and the stored total. */
export function matchesTossPayment(
  payment: TossConfirmResponse,
  input: ConfirmPaymentInput,
): boolean {
  return (
    payment.paymentKey === input.paymentKey &&
    payment.orderId === input.orderId &&
    payment.totalAmount === input.amount
  );
}

// 승인 전 저장된 주문과 토스 콜백 값 대조 (순수 함수 → 단위 테스트 가능)
type OrderForVerify = {
  orderId: string;
  status: 'PENDING' | 'PAID';
  amount: number;
  paymentKey?: string;
};

export type VerifyResult =
  | { valid: true; alreadyPaid: boolean }
  | { valid: false; code: string; message: string };

export function verifyOrderBeforeConfirm(
  order: OrderForVerify,
  input: ConfirmPaymentInput,
): VerifyResult {
  if (input.orderId !== order.orderId) {
    return {
      valid: false,
      code: 'ORDER_MISMATCH',
      message: 'Order numbers do not match.',
    };
  }

  // 금액 위·변조 차단
  if (input.amount !== order.amount) {
    return {
      valid: false,
      code: 'AMOUNT_MISMATCH',
      message: 'The payment amount does not match the order total.',
    };
  }

  if (order.status === 'PAID') {
    // 같은 결제의 새로고침 → 성공 처리 (멱등성)
    if (order.paymentKey === input.paymentKey) {
      return { valid: true, alreadyPaid: true };
    }
    return {
      valid: false,
      code: 'PAYMENT_MISMATCH',
      message: 'The payment details do not match the existing record.',
    };
  }

  return { valid: true, alreadyPaid: false };
}
