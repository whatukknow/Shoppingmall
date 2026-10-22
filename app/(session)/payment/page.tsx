import PaymentPage from '@/domains/payment/components/PaymentPage';
import { getPaymentItems } from '@/domains/payment/payment.api';
import { ApiError } from '@/shared/lib/client';
import { getMe } from '@/domains/auth/users.api';
import type { DeliveryInfos } from '@/domains/payment/data/payment.types';

export default async function Page() {
  // 로그인 회원의 수령 정보로 배송 입력칸을 미리 채운다 (비회원은 빈 값)
  const [items, user] = await Promise.all([
    getPaymentItems(),
    getMe().catch((error: unknown) => {
      if (error instanceof ApiError && error.status === 401) return null;
      throw error;
    }),
  ]);

  const initialDelivery: DeliveryInfos | undefined = user
    ? {
        recipientName: user.recipientName,
        recipientPhone: user.recipientPhone,
        postalCode: user.postalCode,
        recipientAddress: user.recipientAddress,
        recipientAddressDetail: user.recipientAddressDetail,
        entranceInstructions: user.entranceInstructions,
      }
    : undefined;

  return <PaymentPage items={items} initialDelivery={initialDelivery} />;
}
