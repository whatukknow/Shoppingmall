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
  if (productNames.length === 0) return '주문 상품';
  if (productNames.length === 1) return productNames[0];
  return `${productNames[0]} 외 ${productNames.length - 1}건`;
}

// 토스 결제 승인 API 호출
export async function requestTossPaymentConfirm(
  input: ConfirmPaymentInput,
): Promise<
  | { ok: true; data: TossConfirmResponse }
  | { ok: false; code: string; message: string }
> {
  const secretKey = process.env.TOSS_SECRET_KEY;

  if (!secretKey) {
    return {
      ok: false,
      code: 'MISSING_SECRET_KEY',
      message: '.env.local 에 TOSS_SECRET_KEY 가 없습니다.',
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

    const json = await response.json();

    if (!response.ok) {
      return {
        ok: false,
        code: json.code ?? 'TOSS_CONFIRM_FAILED',
        message: json.message ?? '결제 승인에 실패했습니다.',
      };
    }

    if (
      !json ||
      typeof json !== 'object' ||
      typeof json.status !== 'string' ||
      typeof json.orderId !== 'string' ||
      typeof json.paymentKey !== 'string' ||
      typeof json.totalAmount !== 'number'
    ) {
      return {
        ok: false,
        code: 'INVALID_RESPONSE',
        message: '결제 승인 응답을 확인할 수 없습니다.',
      };
    }
    return { ok: true, data: json as TossConfirmResponse };
  } catch {
    return {
      ok: false,
      code: 'CONFIRM_UNAVAILABLE',
      message:
        '승인 결과를 확인하지 못했습니다. 새 결제를 진행하기 전에 주문 상태를 확인해 주세요.',
    };
  }
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
      message: '주문 번호가 일치하지 않습니다.',
    };
  }

  // 금액 위·변조 차단
  if (input.amount !== order.amount) {
    return {
      valid: false,
      code: 'AMOUNT_MISMATCH',
      message: '결제 금액이 주문 금액과 달라요.',
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
      message: '기존 결제 정보와 일치하지 않습니다.',
    };
  }

  return { valid: true, alreadyPaid: false };
}
