'use server';

import { getPaymentItems } from '@/domains/payment/payment.api';
import {
  findOrder,
  insertPendingOrder,
  markOrderPaid,
} from './data/payment.order-store';

import {
  formatOrderName,
  requestTossPaymentConfirm,
  verifyOrderBeforeConfirm,
  type ConfirmPaymentInput,
} from '@/domains/payment/pg-toss/toss.service';

import { validateDelivery } from './data/payment.validation';
import type { DeliveryInfos } from './data/payment.types';

const SHIPPING_FEE = 3000;

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

  const allItems = await getPaymentItems();
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

  // 토스 규칙: 6~64자, 영문/숫자/-/_
  const orderId = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  await insertPendingOrder({
    orderId,
    podIds: items.map((item) => item.podId),
    amount,
    items: items.map((item) => ({ ...item })),
    shippingFee: SHIPPING_FEE,
    shippingInfo: {
      // ← 추가
      recipientName: delivery.recipientName.trim(),
      recipientPhone: delivery.recipientPhone,
      postalCode: delivery.postalCode,
      recipientAddress: delivery.recipientAddress.trim(),
      recipientAddressDetail: delivery.recipientAddressDetail.trim(),
      entranceInstructions: delivery.entranceInstructions.trim(),
    },
    status: 'PENDING',
  });

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
  const order = await findOrder(input.orderId);

  if (!order) {
    return {
      success: false,
      code: 'ORDER_NOT_FOUND',
      message:
        '주문 정보를 찾을 수 없어요. (개발 서버를 재시작하면 임시 주문이 사라져요)',
    };
  }

  // 저장된 주문과 토스 콜백 값 대조 (금액 위·변조, 중복 승인 확인)
  const check = verifyOrderBeforeConfirm(order, input);

  if (!check.valid) {
    return { success: false, code: check.code, message: check.message };
  }

  // 이미 승인된 주문(새로고침 등) → 다시 승인하지 않음 (멱등성)
  if (check.alreadyPaid) {
    return { success: true, receiptUrl: order.receiptUrl ?? null };
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

  // 주문을 PAID로 변경
  const receiptUrl = result.data.receipt?.url ?? null;
  await markOrderPaid(input.orderId, input.paymentKey, receiptUrl);

  return { success: true, receiptUrl };
}
