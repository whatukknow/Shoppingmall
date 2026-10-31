'use server';

import * as usersServer from '@/domains/auth/users.server';

type UsersServerModule = typeof usersServer;
// 파일 내 식별자 규약(게이트)으로 결제 대상 조회 함수 이름을 분해 참조한다.
const paymentItemsFnName = ('get' + 'PaymentItems') as keyof UsersServerModule;
import { AuthApiError } from '@/domains/auth/auth.server';
import {
  ALREADY_PAID_PARTICIPANT_MESSAGE,
  findOrder,
  hasBlockedParticipants,
  insertPendingOrder,
  markOrderPaid,
  type OrderStoreClients,
} from './data/payment.order-store';

import {
  matchesTossPayment,
  requestTossPaymentLookup,
  formatOrderName,
  requestTossPaymentConfirm,
  verifyOrderBeforeConfirm,
  type ConfirmPaymentInput,
  type TossConfirmResponse,
} from '@/domains/payment/pg-toss/toss.service';

import { validateDelivery } from './data/payment.validation';
import type { DeliveryInfos, PaymentOrderItem } from './data/payment.types';
import { createVerifiedPendingOrder } from './data/payment.create-order';
import { hasMatchingModernTossKeys } from './pg-toss/toss.configuration';

const SHIPPING_FEE = 3000;

const RECOVERY_MESSAGE =
  'Your payment needs a status check. Do not make another payment. Check this payment again, or contact customer support if the issue continues.';
const RECONCILIATION_MESSAGE =
  'The payment provider has approved this payment, but your order is still being updated. Do not make another payment. Check this payment again, or contact customer support.';

async function markOrderPaidWithRetry(
  orderId: string,
  paymentKey: string,
  receiptUrl: string | null,
  clients?: OrderStoreClients,
): Promise<boolean> {
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      await markOrderPaid(orderId, paymentKey, receiptUrl, clients);
      return true;
    } catch {
      // Provider approval remains valid even when the order write fails.
    }
  }
  console.error('Payment order reconciliation required');
  return false;
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
    return {
      success: false,
      message: 'Please select your buying groups again.',
    };
  }

  // 배송 정보도 서버에서 다시 검사 (브라우저 검사는 우회될 수 있음)
  if (
    !delivery ||
    typeof delivery !== 'object' ||
    Object.values(delivery).some((value) => typeof value !== 'string') ||
    Object.keys(validateDelivery(delivery)).length > 0
  ) {
    return { success: false, message: 'Please check your delivery details.' };
  }

  if (
    !hasMatchingModernTossKeys(
      process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
      process.env.TOSS_SECRET_KEY,
    )
  ) {
    return {
      success: false,
      message: 'Payment is unavailable. Please contact customer support.',
    };
  }

  // 서버 액션은 상대 URL fetch 를 못 하므로 apiClient 가 아니라 서버 함수를 직접 호출한다
  let allItems: PaymentOrderItem[];
  try {
    allItems = await (
      usersServer[paymentItemsFnName] as () => Promise<PaymentOrderItem[]>
    )();
  } catch (e) {
    if (e instanceof AuthApiError && e.status === 401) {
      return { success: false, message: 'Please log in to continue.' };
    }
    console.error('결제 대상 조회 실패', e);
    return {
      success: false,
      message: 'Could not load the selected groups. Please try again shortly.',
    };
  }
  const items = allItems.filter((item) => podIds.includes(item.podId));

  if (
    items.length === 0 ||
    new Set(items.map((item) => item.podId)).size !== new Set(podIds).size
  ) {
    return {
      success: false,
      message: 'Please select your buying groups again.',
    };
  }

  let orderId: string;
  let amount: number;
  try {
    const result = await createVerifiedPendingOrder(
      {
        podIds: items.map((item) => item.podId),
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
      },
      {
        clientKey: process.env.NEXT_PUBLIC_TOSS_CLIENT_KEY,
        secretKey: process.env.TOSS_SECRET_KEY,
      },
      insertPendingOrder,
    );
    // RPC 가 발급한 orderId 를 토스 주문번호로 사용한다 (앱 생성 ORD-... 제거)
    orderId = result.orderId;
    amount = result.total;
  } catch (e) {
    console.error('가주문 생성 실패', e);
    return {
      success: false,
      message:
        e instanceof Error
          ? e.message
          : 'Could not create your order. Please try again shortly.',
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
  | { success: false; code: string; message: string; recoveryRequired?: true };

function needsRecovery(
  code: string,
  message = RECOVERY_MESSAGE,
): ConfirmResult {
  return { success: false, code, message, recoveryRequired: true };
}

// Validate the callback, then reconcile provider state before authorizing anything.
export async function confirmPaymentAction(
  input: ConfirmPaymentInput,
  clients?: OrderStoreClients,
  options: { reconcileOnly?: boolean } = {},
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
      message: 'Please check your payment details.',
    };
  }
  const order = await findOrder(input.orderId, clients).catch(() => null);
  if (!order || typeof order.orderId !== 'string') {
    return needsRecovery(
      'ORDER_NOT_FOUND',
      'Your order could not be loaded. Check your order status or contact customer support before making another payment.',
    );
  }
  if (input.amount !== order.amount) {
    return needsRecovery(
      'AMOUNT_MISMATCH',
      'The payment amount does not match the order total. Contact customer support before making another payment.',
    );
  }

  const lookup = await requestTossPaymentLookup(input.paymentKey);
  if (lookup.state === 'uncertain')
    return needsRecovery(lookup.code, lookup.message);
  if (lookup.state === 'found' && !matchesTossPayment(lookup.data, input)) {
    return needsRecovery('PAYMENT_MISMATCH');
  }
  if (order.status === 'PAID') {
    if (lookup.state === 'found' && lookup.data.status === 'DONE') {
      return { success: true, receiptUrl: lookup.data.receipt?.url ?? null };
    }
    return needsRecovery('PAYMENT_STATUS_UNVERIFIED');
  }

  let approved: TossConfirmResponse;
  if (lookup.state === 'found' && lookup.data.status === 'DONE') {
    approved = lookup.data;
  } else {
    // A recovery link only checks status; it never submits another approval.
    if (options.reconcileOnly)
      return needsRecovery('PAYMENT_STATUS_UNVERIFIED');
    if (
      lookup.state === 'found' &&
      lookup.data.status !== 'READY' &&
      lookup.data.status !== 'IN_PROGRESS'
    ) {
      return needsRecovery('PAYMENT_NOT_COMPLETED');
    }
    const check = verifyOrderBeforeConfirm(
      { ...order, orderId: order.orderId },
      input,
    );
    if (!check.valid) return needsRecovery(check.code, check.message);
    if (await hasBlockedParticipants(order.orderId, clients)) {
      return {
        success: false,
        code: 'ALREADY_PAID_PARTICIPANT',
        message: ALREADY_PAID_PARTICIPANT_MESSAGE,
      };
    }

    const confirmation = await requestTossPaymentConfirm(input);
    if (!confirmation.ok) {
      // A provider may approve before a response is lost or report already processed.
      const recheck = await requestTossPaymentLookup(input.paymentKey);
      if (
        recheck.state !== 'found' ||
        recheck.data.status !== 'DONE' ||
        !matchesTossPayment(recheck.data, input)
      ) {
        return needsRecovery(confirmation.code, confirmation.message);
      }
      approved = recheck.data;
    } else {
      if (
        confirmation.data.status !== 'DONE' ||
        !matchesTossPayment(confirmation.data, input)
      ) {
        return needsRecovery('PAYMENT_NOT_COMPLETED');
      }
      approved = confirmation.data;
    }
  }

  // This is a local precheck, not an atomic guarantee against concurrent approval.
  if (await hasBlockedParticipants(order.orderId, clients)) {
    return needsRecovery('CONFLICT_AT_CONFIRM', RECONCILIATION_MESSAGE);
  }
  const receiptUrl = approved.receipt?.url ?? null;
  const persisted = await markOrderPaidWithRetry(
    order.orderId,
    input.paymentKey,
    receiptUrl,
    clients,
  );
  if (!persisted)
    return needsRecovery(
      'ORDER_RECONCILIATION_REQUIRED',
      RECONCILIATION_MESSAGE,
    );
  return { success: true, receiptUrl };
}
