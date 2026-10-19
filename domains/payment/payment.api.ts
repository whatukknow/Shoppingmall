import { apiClient } from '@/shared/lib/client';
import type { PaymentOrderItem } from './data/payment.types';

// 결제 대상 주문 상품 목록 가져오기
// TODO: Supabase 전환 시 이 함수 내부만 교체
export async function getPaymentItems(): Promise<PaymentOrderItem[]> {
  return apiClient.get<PaymentOrderItem[]>('payment/items');
}
