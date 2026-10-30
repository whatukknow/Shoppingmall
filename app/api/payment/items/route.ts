import { connection } from 'next/server';

import { AuthApiError } from '@/domains/auth/auth.server';
import { getPaymentItems } from '@/domains/auth/users.server';

/** GET /api/payment/items — 결제 가능 상품 목록 (봉투 없이 배열) */
export async function GET(): Promise<Response> {
  await connection();
  try {
    // 목업 응답 계약이 봉투 없는 배열 그대로다
    return Response.json(await getPaymentItems());
  } catch (e) {
    if (e instanceof AuthApiError) {
      return Response.json(
        { error: { message: e.message } },
        { status: e.status },
      );
    }
    console.error('결제 상품 목록 조회 실패', e);
    return Response.json(
      { error: { message: 'Could not load checkout items.' } },
      { status: 500 },
    );
  }
}
