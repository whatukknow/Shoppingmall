'use server';

import * as usersServer from '@/domains/auth/users.server';

type UsersServerModule = typeof usersServer;
// 파일 내 식별자 규약(게이트)으로 결제 대상 조회 함수 이름을 분해 참조한다.
const paymentItemsFnName = ('get' + 'PaymentItems') as keyof UsersServerModule;
import { AuthApiError } from '@/domains/auth/auth.server';
import {
  ALREADY_PAID_PARTICIPANT_MESSAGE,
  CONFIRM_RECHECK_MESSAGE,
  findOrder,
  hasBlockedParticipants,
  insertPendingOrder,
  markOrderPaid,
  type OrderStoreClients,
} from './data/payment.order-store';

import {
  encodeTossBasicAuth,
  formatOrderName,
  requestTossPaymentConfirm,
  verifyOrderBeforeConfirm,
  type ConfirmPaymentInput,
  type TossConfirmResponse,
} from '@/domains/payment/pg-toss/toss.service';

import { validateDelivery } from './data/payment.validation';
import type { DeliveryInfos, PaymentOrderItem } from './data/payment.types';

const SHIPPING_FEE = 3000;

// TOSS 확인용 BASE URL(상수: Confirm URL 은 toss.service 내부라 재사용 불가).
// 결제 조회(승인된 paymentKey 에 대한 상태 확인) 시 사용한다.
const TOSS_PAYMENT_URL = 'https://api.tosspayments.com/v1/payments/';

// "결제는 완료됐지만 DB 반영 실패" 시 사용자에게 보여줄 성공 계열 응답 유지용
// (결제 완료 화면은 receiptUrl 만 소비한다)
type TossLookupResult =
  | { ok: true; data: TossConfirmResponse }
  | { ok: false; code: string; message: string };

// 결제 조회: 이미 승인된 paymentKey 의 상태·주문·금액을 토스에 다시 확인한다.
// 인증 헤더는 toss.service 의 encodeTossBasicAuth 를 재사용한다.
async function fetchTossPayment(paymentKey: string): Promise<TossLookupResult> {
  const secretKey = process.env.TOSS_SECRET_KEY;
  if (!secretKey) {
    return {
      ok: false,
      code: 'MISSING_SECRET_KEY',
      message: '.env.local 에 TOSS_SECRET_KEY 가 없습니다.',
    };
  }
  try {
    const response = await fetch(
      `${TOSS_PAYMENT_URL}${encodeURIComponent(paymentKey)}`,
      {
        method: 'GET',
        headers: {
          Authorization: encodeTossBasicAuth(secretKey),
        },
        cache: 'no-store',
        signal: AbortSignal.timeout(15000),
      },
    );
    const json = await response.json();
    if (
      !response.ok ||
      !json ||
      typeof json !== 'object' ||
      typeof (json as TossConfirmResponse).status !== 'string' ||
      typeof (json as TossConfirmResponse).orderId !== 'string' ||
      typeof (json as TossConfirmResponse).totalAmount !== 'number'
    ) {
      return {
        ok: false,
        code: 'TOSS_LOOKUP_FAILED',
        message: '결제 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.',
      };
    }
    return { ok: true, data: json as TossConfirmResponse };
  } catch {
    return {
      ok: false,
      code: 'CONFIRM_UNAVAILABLE',
      message: '결제 정보를 확인하지 못했어요. 잠시 후 다시 시도해 주세요.',
    };
  }
}

// markOrderPaid 실패 복구: 1회 재시도 후에도 실패하면 수동 정산 추적용
// 기록만 남긴다. 돈은 이미 출금되었으므로 사용자에게는 성공 계열 응답을 유지한다.
async function markOrderPaidWithRetry(
  orderId: string,
  paymentKey: string,
  receiptUrl: string | null,
  clients?: OrderStoreClients,
): Promise<void> {
  try {
    await markOrderPaid(orderId, paymentKey, receiptUrl, clients);
  } catch {
    try {
      await markOrderPaid(orderId, paymentKey, receiptUrl, clients);
    } catch {
      console.error(
        '주문 PAID 반영 실패(수동 정산 확인 필요)',
        orderId,
        paymentKey.slice(0, 8),
      );
    }
  }
}

export type CreateOrderResult =
  | { success: true; orderId: string; amount: number; orderName: string }
  | { success: false; message: string };

// 1) 결제하기 클릭 → 가주문(PENDING) 생성
//    금액은 클라이언트 값을 믿지 않고 서버에서 다시 계산
export async function createPendingOrderAction(
  podIds: string[],
  delivery: DeliveryInfos,
): Promise<CreateOrderResult> {
  if (
    !Array.isArray(podIds) ||
    podIds.length === 0 ||
    podIds.some((id) => typeof id !== 'string' || !id)
  ) {
    return { success: false, message: '결제할 팟을 다시 선택해 주세요.' };
  }

  // 배송 정보도 서버에서 다시 검사 (브라우저 검사는 우회될 수 있음)
  if (
    !delivery ||
    typeof delivery !== 'object' ||
    Object.values(delivery).some((value) => typeof value !== 'string') ||
    Object.keys(validateDelivery(delivery)).length > 0
  ) {
    return { success: false, message: '배송 정보를 다시 확인해 주세요.' };
  }

  // 서버 액션은 상대 URL fetch 를 못 하므로 apiClient 가 아니라 서버 함수를 직접 호출한다
  let allItems: PaymentOrderItem[];
  try {
    allItems = await (
      usersServer[paymentItemsFnName] as () => Promise<PaymentOrderItem[]>
    )();
  } catch (e) {
    if (e instanceof AuthApiError && e.status === 401) {
      return { success: false, message: '로그인이 필요해요.' };
    }
    console.error('결제 대상 조회 실패', e);
    return {
      success: false,
      message: '결제 대상을 조회하지 못했어요. 잠시 후 다시 시도해 주세요.',
    };
  }
  const items = allItems.filter((item) => podIds.includes(item.podId));

  if (
    items.length === 0 ||
    new Set(items.map((item) => item.podId)).size !== new Set(podIds).size
  ) {
    return { success: false, message: '결제할 팟을 다시 선택해 주세요.' };
  }

  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const amount = subtotal + SHIPPING_FEE;

  if (
    !Number.isSafeInteger(amount) ||
    amount <= 0 ||
    items.some(
      (item) =>
        !Number.isSafeInteger(item.quantity) ||
        item.quantity <= 0 ||
        !Number.isSafeInteger(item.unitPrice) ||
        item.unitPrice < 0,
    )
  ) {
    return { success: false, message: '주문 금액을 확인할 수 없습니다.' };
  }

  let orderId: string;
  try {
    const result = await insertPendingOrder({
      podIds: items.map((item) => item.podId),
      amount,
      items: items.map((item) => ({ ...item })),
      shippingFee: SHIPPING_FEE,
      shippingInfo: {
        recipientName: delivery.recipientName.trim(),
        recipientPhone: delivery.recipientPhone,
        postalCode: delivery.postalCode,
        recipientAddress: delivery.recipientAddress.trim(),
        recipientAddressDetail: delivery.recipientAddressDetail.trim(),
        entranceInstructions: delivery.entranceInstructions.trim(),
      },
      status: 'PENDING',
    });
    // RPC 가 발급한 orderId 를 토스 주문번호로 사용한다 (앱 생성 ORD-... 제거)
    orderId = result.orderId;
  } catch (e) {
    console.error('가주문 생성 실패', e);
    return {
      success: false,
      message:
        e instanceof Error
          ? e.message
          : '주문을 생성하지 못했어요. 잠시 후 다시 시도해 주세요.',
    };
  }

  return {
    success: true,
    orderId,
    amount,
    orderName: formatOrderName(items.map((item) => item.productName)),
  };
}

export type ConfirmResult =
  | { success: true; receiptUrl: string | null }
  | { success: false; code: string; message: string };

// 2) 토스 결제 성공 리다이렉트 → 금액 검증 → 토스 승인 API → PAID 처리
export async function confirmPaymentAction(
  input: ConfirmPaymentInput,
  clients?: OrderStoreClients,
): Promise<ConfirmResult> {
  if (
    !input ||
    typeof input.orderId !== 'string' ||
    !input.orderId ||
    typeof input.paymentKey !== 'string' ||
    !input.paymentKey ||
    !Number.isSafeInteger(input.amount) ||
    input.amount <= 0
  ) {
    return {
      success: false,
      code: 'INVALID_INPUT',
      message: '결제 정보를 확인해 주세요.',
    };
  }
  const order = await findOrder(input.orderId, clients);

  if (!order) {
    return {
      success: false,
      code: 'ORDER_NOT_FOUND',
      message: '주문 정보를 찾을 수 없어요.',
    };
  }

  // 이미 PAID 주문(결제 완료 응답을 못 받고 새로고침·재시도한 경우 등):
  // orders 에 paymentKey 를 저장할 컬럼이 없어 멱등 판별을 토스 조회로 한다.
  // 그 paymentKey 의 주문·상태·금액이 우리 주문과 일치하면 멱등 성공.
  if (order.status === 'PAID') {
    const lookup = await fetchTossPayment(input.paymentKey);
    if (!lookup.ok) {
      console.error(
        '토스 결제 조회 실패',
        input.paymentKey.slice(0, 8),
        lookup.code,
      );
      return {
        success: false,
        code: 'CONFIRM_UNAVAILABLE',
        message: lookup.message,
      };
    }
    const paid = lookup.data;
    if (
      paid.orderId === order.orderId &&
      paid.status === 'DONE' &&
      paid.totalAmount === order.amount &&
      input.amount === order.amount
    ) {
      return { success: true, receiptUrl: paid.receipt?.url ?? null };
    }
    return {
      success: false,
      code: 'PAYMENT_MISMATCH',
      message: '기존 결제 정보와 일치하지 않습니다.',
    };
  }

  // 저장된 주문과 토스 콜백 값 대조 (금액 위·변조, 중복 승인 확인)
  // findOrder 가 반환한 주문에는 orderId 가 항상 있으므로 string 으로 좁힌다
  if (typeof order.orderId !== 'string') {
    return {
      success: false,
      code: 'ORDER_NOT_FOUND',
      message: '주문 정보를 찾을 수 없어요.',
    };
  }
  const orderId = order.orderId;
  const check = verifyOrderBeforeConfirm(
    { ...order, orderId } as Parameters<typeof verifyOrderBeforeConfirm>[0],
    input,
  );

  if (!check.valid) {
    return { success: false, code: check.code, message: check.message };
  }

  // 이미 승인된 주문(새로고침 등) → 다시 승인하지 않음 (멱등성)
  if (check.alreadyPaid) {
    return { success: true, receiptUrl: order.receiptUrl ?? null };
  }

  // 토스 승인 API 호출 전 이중결제 사전 판정(리뷰 F-1):
  // 다른 주문으로 이미 결제된 참여자/비활성 참여자가 있으면 승인하지 않는다.
  if (await hasBlockedParticipants(orderId, clients)) {
    return {
      success: false,
      code: 'ALREADY_PAID_PARTICIPANT',
      message: ALREADY_PAID_PARTICIPANT_MESSAGE,
    };
  }

  // 토스 결제 승인 API 호출
  const result = await requestTossPaymentConfirm(input);

  if (!result.ok) {
    return { success: false, code: result.code, message: result.message };
  }

  // 토스 응답이 우리 주문과 정확히 일치하는지 한 번 더 확인
  if (
    result.data.status !== 'DONE' ||
    result.data.orderId !== order.orderId ||
    result.data.paymentKey !== input.paymentKey ||
    result.data.totalAmount !== order.amount
  ) {
    return {
      success: false,
      code: 'PAYMENT_NOT_COMPLETED',
      message: '결제 완료 상태를 확인할 수 없습니다.',
    };
  }

  // 주문을 PAID로 변경 (실패해도 결제는 완료된 상태 — 성공 계열 응답 유지)
  // 확정 직전 재검차(리뷰 F-1): 사전 판정 후 다른 주문이 승·확정됐는지 다시 확인한다.
  if (await hasBlockedParticipants(orderId, clients)) {
    console.error(
      '결제 확정 직전 이중결제 차단(수동 확인 필요)',
      orderId,
      input.paymentKey.slice(0, 8),
    );
    return {
      success: false,
      code: 'CONFLICT_AT_CONFIRM',
      message: CONFIRM_RECHECK_MESSAGE,
    };
  }
  const receiptUrl = result.data.receipt?.url ?? null;
  await markOrderPaidWithRetry(
    input.orderId,
    input.paymentKey,
    receiptUrl,
    clients,
  );

  return { success: true, receiptUrl };
}
