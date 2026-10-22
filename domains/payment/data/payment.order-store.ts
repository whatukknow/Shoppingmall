import type { PaymentOrderItem } from './payment.types';

// 임시 가주문 저장소 (서버 메모리)
// TODO: Supabase 연동 시 이 파일의 함수 3개 내부만 orders / payments 테이블 쿼리로 교체

export type MockOrder = {
  orderId: string;
  podIds: string[];
  items?: PaymentOrderItem[]; // 주문 생성 시 상품 스냅샷
  shippingFee?: number;
  amount: number;
  status: 'PENDING' | 'PAID';
  paymentKey?: string;
  receiptUrl?: string | null;
};

// 개발 서버 핫리로드에도 데이터가 남도록 globalThis 에 보관
const globalStore = globalThis as unknown as {
  __mockOrders?: Map<string, MockOrder>;
};
const orders = (globalStore.__mockOrders ??= new Map<string, MockOrder>());

export async function insertPendingOrder(order: MockOrder): Promise<void> {
  orders.set(order.orderId, order);
}

export async function findOrder(orderId: string): Promise<MockOrder | null> {
  return orders.get(orderId) ?? null;
}

export async function markOrderPaid(
  orderId: string,
  paymentKey: string,
  receiptUrl: string | null,
): Promise<void> {
  const order = orders.get(orderId);
  if (!order) return;
  orders.set(orderId, { ...order, status: 'PAID', paymentKey, receiptUrl });
}
