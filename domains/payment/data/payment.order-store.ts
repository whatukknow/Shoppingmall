import { randomUUID } from 'node:crypto';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createAdminClient } from '@/shared/lib/supabase/admin';
import { createServerClient } from '@/shared/lib/supabase/server';
import type { Database } from '@/shared/lib/supabase/database.types';
import type {
  DeliveryInfos,
  PaymentOrderItem,
} from '@/domains/payment/data/payment.types';

// DB 의 orders.status 값 (팀 데이터 규칙: 소문자)
export const ORDER_STATUS = {
  PENDING: 'pending',
  PAID: 'paid',
} as const;

// 가주문·승인 기록 저장소: 실DB rpc 로 처리한다.
// - 가주문 생성: 세션 클라이언트로 rpc_create_order (RLS 세션 컨텍스트)
//   → RPC 가 배송비·총액을 직접 기록하고 응답으로 돌려준다
// - 주문 조회·참여자 판정: 세션 클라이언트 (RLS 본인 SELECT)
// - 결제 확정: service_role 전용 rpc_mark_order_paid 를 관리자 클라이언트로 호출

export type OrderRecord = {
  orderId?: string; // rpc_create_order 가 발급한 orderId 로 대체됨 — 입력값은 무시
  podIds: string[];
  items?: PaymentOrderItem[]; // 주문 생성 시 상품 스냅샷
  shippingFee?: number;
  shippingInfo?: DeliveryInfos;
  amount: number;
  status: 'PENDING' | 'PAID';
  paymentKey?: string;
  receiptUrl?: string | null;
};

export type PendingOrderResult = {
  orderId: string;
  subtotal: number;
  shippingFee: number;
  total: number;
};

/** 테스트 주입용 클라이언트 세트 (admin 은 rpc_mark_order_paid 전용 — 지연 생성) */
export type OrderStoreClients = {
  session: SupabaseClient<Database>;
  admin?: SupabaseClient<Database> | null;
};

const LOGIN_REQUIRED_MESSAGE = 'Please log in to continue.';
const AMOUNT_MISMATCH_MESSAGE =
  'The order total has changed. Refresh and try again.';
const STORE_ERROR_MESSAGE =
  'Could not process your order. Please try again shortly.';
const NOT_PAYMENT_READY_MESSAGE =
  'This group is not ready for payment. Check your selected groups.';
const PAYMENT_DUE_PASSED_MESSAGE =
  'The payment deadline has passed. Select your groups again.';
/** 사전 판정 차단: 참여자가 이미 결제되었거나 비활성인 경우 */
export const ALREADY_PAID_PARTICIPANT_MESSAGE =
  'One of your selected groups has already been paid for.';
/** 확정 직전 재검사 차단: 승인은 이미 완료됐을 수 있어 고객센터 안내 */
export const CONFIRM_RECHECK_MESSAGE =
  'Could not confirm payment. Please contact customer support.';

function defaultClients(): OrderStoreClients {
  // admin 은 결제 확정(rpc_mark_order_paid) 시점에만 생성한다
  return { session: createServerClient() };
}

async function resolveUserId(
  session: SupabaseClient<Database>,
): Promise<string> {
  const { data, error } = await session.auth.getUser();
  if (error || !data.user) throw new Error(LOGIN_REQUIRED_MESSAGE);
  return data.user.id;
}

/** rpc 오류 메시지 접두 코드 → 사용자 메시지 매핑 (원문은 console.error 에만) */
function mapOrderRpcError(origin: unknown, tag: string): Error {
  const e = origin as { code?: string; message?: string };
  console.error(`${tag} 실패`, e?.code ?? '', e?.message ?? '');
  const prefix = (e?.message ?? '').split(':')[0]?.trim() ?? '';
  if (prefix === 'NOT_PAYMENT_READY') {
    return new Error(NOT_PAYMENT_READY_MESSAGE);
  }
  if (prefix === 'PAYMENT_DUE_PASSED') {
    return new Error(PAYMENT_DUE_PASSED_MESSAGE);
  }
  if (
    prefix === 'PARTICIPANT_ALREADY_PAID' ||
    prefix === 'ALREADY_PAID' ||
    prefix === 'NOT_A_MEMBER'
  ) {
    return new Error(ALREADY_PAID_PARTICIPANT_MESSAGE);
  }
  const rpcCodeMessages: Record<string, string> = {
    POD_NOT_FOUND: 'Please select your buying groups again.',
    EMPTY_PODS: 'Please select your buying groups again.',
    DUPLICATE_PODS: 'Please select your buying groups again.',
  };
  const codeMessage = rpcCodeMessages[prefix];
  if (codeMessage) return new Error(codeMessage);
  return new Error(STORE_ERROR_MESSAGE);
}

/** rpc 실행 공통: 반드시 클라이언트 인스턴스에 바인딩해 호출한다 (this 유실 방지) */
async function callOrderRpc(
  client: SupabaseClient<Database>,
  fn: string,
  args: Record<string, unknown>,
  tag: string,
): Promise<Record<string, unknown>> {
  const rpc = client.rpc as unknown as (
    this: SupabaseClient<Database>,
    fn: string,
    args?: Record<string, unknown>,
  ) => Promise<{ data: unknown; error: unknown }>;
  const { data, error } = await rpc.call(client, fn, args);
  if (error) throw mapOrderRpcError(error, tag);
  return (data ?? {}) as Record<string, unknown>;
}

/**
 * 가주문(PENDING) 생성: rpc_create_order 가 orders/order_items 를 기록하고
 * 배송비·total 을 포함한 응답을 돌려준다. 세션 클라이언트(RLS) 만 사용한다.
 */
export async function insertPendingOrder(
  order: OrderRecord,
  clients?: OrderStoreClients,
): Promise<PendingOrderResult> {
  const injected = clients ?? defaultClients();
  const session = injected.session;
  await resolveUserId(session);

  const shippingInfo = order.shippingInfo;
  const result = await callOrderRpc(
    session,
    'rpc_create_order',
    {
      p_pod_ids: order.podIds,
      p_payment_method: 'toss',
      p_recipient: {
        name: shippingInfo?.recipientName ?? '',
        phone: shippingInfo?.recipientPhone ?? '',
        postalCode: shippingInfo?.postalCode ?? '',
        address: shippingInfo?.recipientAddress ?? '',
        addressDetail: shippingInfo?.recipientAddressDetail ?? '',
        entranceInstructions: shippingInfo?.entranceInstructions ?? '',
      },
      p_idempotency_key: randomUUID(),
    },
    '가주문 생성',
  );

  const orderId = typeof result.orderId === 'string' ? result.orderId : '';
  const subtotal = typeof result.subtotal === 'number' ? result.subtotal : null;
  if (!orderId || subtotal == null) {
    console.error('가주문 생성 rpc 응답 형식 오류', result);
    throw new Error(STORE_ERROR_MESSAGE);
  }
  const rpcShippingFee =
    typeof result.shippingFee === 'number' ? result.shippingFee : null;
  const rpcTotal = typeof result.total === 'number' ? result.total : null;
  const shippingFee = rpcShippingFee ?? order.shippingFee ?? 0;
  const total = rpcTotal ?? subtotal + shippingFee;
  if (order.amount !== total) {
    throw new Error(AMOUNT_MISMATCH_MESSAGE);
  }

  return {
    orderId,
    subtotal,
    shippingFee,
    total,
  };
}

/** 주문 조회: 본인(profile_id) 주문만 OrderRecord 로 변환한다 — 세션 클라이언트(RLS) */
export async function findOrder(
  orderId: string,
  clients?: OrderStoreClients,
): Promise<OrderRecord | null> {
  const injected = clients ?? defaultClients();
  const session = injected.session;
  // 비로그인이면 주문도 없는 것으로 취급 (결과 페이지 500 방지)
  const { data, error } = await session.auth.getUser();
  if (error || !data.user) return null;
  const uid = data.user.id;

  // database.types 의 쿼리 결과가 never 로 추론되는 문제 회피 (기존 쿼리 유지 + 캐스트)
  const orderRes = (await session
    .from('orders')
    .select('*')
    .eq('id', orderId)
    .eq('profile_id', uid)
    .maybeSingle()) as unknown as {
    data: Database['public']['Tables']['orders']['Row'] | null;
    error: { message: string } | null;
  };
  const { data: orderRow, error: orderError } = orderRes;
  if (orderError) throw new Error(STORE_ERROR_MESSAGE);
  if (!orderRow) return null;

  const itemsRes = (await session
    .from('order_items')
    .select('*')
    .eq('order_id', orderId)) as unknown as {
    data: Database['public']['Tables']['order_items']['Row'][] | null;
    error: { message: string } | null;
  };
  const { data: itemRows, error: itemsError } = itemsRes;
  if (itemsError) throw new Error(STORE_ERROR_MESSAGE);
  const items = (itemRows ??
    []) as Database['public']['Tables']['order_items']['Row'][];

  // 'failed' 는 결제 가능 상태가 아니다 — 주문 없음으로 취급한다.
  if (
    orderRow.status !== ORDER_STATUS.PENDING &&
    orderRow.status !== ORDER_STATUS.PAID
  )
    return null;

  return {
    orderId: orderRow.id,
    podIds: items
      .map((item) => item.pod_id)
      .filter((id): id is string => typeof id === 'string'),
    items: items.map((item) => ({
      podId: item.pod_id ?? '',
      productName: item.product_name ?? '',
      optionLabel: item.portion_label ?? '',
      quantity: 1,
      unitPrice: item.unit_price ?? 0,
      imageUrl: item.image_url ?? '',
    })),
    shippingFee: orderRow.shipping_fee ?? undefined,
    amount: orderRow.total ?? 0,
    status:
      orderRow.status === ORDER_STATUS.PAID
        ? ('PAID' as const)
        : ('PENDING' as const),
    paymentKey: undefined,
    receiptUrl: null,
  };
}

/**
 * 이중결제 사전 판정: 주문의 order_items.participant_id → pod_participants
 * (paid_at, paid_order_id, is_active) 를 세션 클라이언트(RLS 본인 SELECT) 로 조회해
 * "다른 주문으로 이미 결제된 참여자 또는 비활성 참여자"가 있는지 확인한다.
 * 판정 불가(조회 실패·participant_id 누락·참여자 행 없음)는 안전하게 차단(true).
 */
export async function hasBlockedParticipants(
  orderId: string,
  clients?: OrderStoreClients,
): Promise<boolean> {
  const session = (clients ?? defaultClients()).session;
  const itemsRes = (await session
    .from('order_items')
    .select('participant_id')
    .eq('order_id', orderId)) as unknown as {
    data: { participant_id: number | null }[] | null;
    error: { message: string } | null;
  };
  if (itemsRes.error) {
    console.error(
      '참여자 이중결제 사전 판정 실패(order_items)',
      orderId,
      itemsRes.error.message,
    );
    return true;
  }
  const participantIds = (itemsRes.data ?? [])
    .map((row) => row.participant_id)
    .filter((id): id is number => typeof id === 'number');
  if (participantIds.length === 0) {
    console.error(
      '참여자 이중결제 사전 판정 실패(participant_id 누락)',
      orderId,
    );
    return true;
  }
  for (const pid of participantIds) {
    const res = (await session
      .from('pod_participants')
      .select('paid_at, paid_order_id, is_active')
      .eq('id', pid)
      .maybeSingle()) as unknown as {
      data: {
        paid_at: string | null;
        paid_order_id: string | null;
        is_active: boolean | null;
      } | null;
      error: { message: string } | null;
    };
    if (res.error) {
      console.error(
        '참여자 이중결제 사전 판정 실패(pod_participants)',
        orderId,
        res.error.message,
      );
      return true;
    }
    const row = res.data;
    if (!row) {
      console.error(
        '참여자 이중결제 사전 판정 실패(참여자 행 없음)',
        orderId,
        pid,
      );
      return true;
    }
    if (row.paid_at != null && row.paid_order_id !== orderId) return true;
    if (row.is_active === false) return true;
  }
  return false;
}

/**
 * 결제 승인 확정: service_role 전용 rpc_mark_order_paid 를 관리자 클라이언트로
 * 호출한다. orders·pod_participants paid 전이는 DB 함수 내부에서 처리한다.
 * receiptUrl 은 orders 컬럼이 없어 저장하지 않는다.
 */
export async function markOrderPaid(
  orderId: string,
  paymentKey: string,
  receiptUrl: string | null,
  clients?: OrderStoreClients,
): Promise<void> {
  void receiptUrl;
  const injected = clients ?? defaultClients();
  // admin 은 결제 확정(rpc_mark_order_paid) 시점에만 생성·사용한다 — 지연 생성
  try {
    await callOrderRpc(
      injected.admin ?? createAdminClient(),
      'rpc_mark_order_paid',
      { p_order_id: orderId, p_payment_key: paymentKey },
      '주문 PAID 반영',
    );
  } catch (e) {
    // 수동 정산 추적용 기록 — 결제는 이미 완료된 상태다
    console.error(
      '주문 PAID 반영 실패(수동 정산 확인 필요)',
      orderId,
      paymentKey.slice(0, 8),
      e,
    );
    throw new Error('주문 PAID 반영 실패');
  }
}
