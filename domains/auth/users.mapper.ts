import type { User, MyPayment } from './users.types';
import type { Database } from '@/shared/lib/supabase/database.types';

type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
type OrdersRow = Database['public']['Tables']['orders']['Row'];
type OrderItemsRow = Database['public']['Tables']['order_items']['Row'];

/**
 * GET users/me → User ().
 * 프로필 컬럼에 주소지가 없으므로, 최근 주문 1건의 recipient_* 에서 임시 사용.
 */
export function toUser(
  profile: ProfilesRow,
  latestOrder: OrdersRow | null,
  hasTasteProfile: boolean,
): User {
  const orEmpty = (v: string | null) => v ?? '';
  return {
    id: profile.id,
    name: orEmpty(profile.display_name),
    email: orEmpty(profile.email),
    recipientName: latestOrder ? orEmpty(latestOrder.recipient_name) : '',
    recipientPhone: latestOrder ? orEmpty(latestOrder.recipient_phone) : '',
    postalCode: latestOrder ? orEmpty(latestOrder.postal_code) : '',
    recipientAddress: latestOrder ? orEmpty(latestOrder.recipient_address) : '',
    recipientAddressDetail: latestOrder
      ? orEmpty(latestOrder.recipient_address_detail)
      : '',
    entranceInstructions: latestOrder
      ? orEmpty(latestOrder.entrance_instructions)
      : '',
    defaultAddress: latestOrder
      ? `${orEmpty(latestOrder.recipient_address)} ${orEmpty(
          latestOrder.recipient_address_detail,
        )}`.trim()
      : '',
    hasTasteProfile,
  };
}

const PAYMENT_STATUSES = ['pending', 'paid', 'failed', 'cancelled'] as const;
const PAYMENT_METHODS = ['card', 'naverpay', 'kakaopay', 'tosspay'] as const;

function isPaymentStatus(value: string): value is MyPayment['status'] {
  return (PAYMENT_STATUSES as readonly string[]).includes(value);
}

function isPaymentMethod(value: string): value is MyPayment['paymentMethod'] {
  return (PAYMENT_METHODS as readonly string[]).includes(value);
}

/** DB 문자열을 허용 집합으로 검증해 MyPayment['status'] 로 변환합니다. */
function toPaymentStatus(value: string): MyPayment['status'] {
  // 미지원 값은 기본값 'pending' 으로 대체
  return isPaymentStatus(value) ? value : 'pending';
}

/** DB 문자열을 허용 집합으로 검증해 MyPayment['paymentMethod'] 로 변환합니다. */
function toPaymentMethod(value: string): MyPayment['paymentMethod'] {
  // 미지원 값은 기본값 'card' 로 대체
  return isPaymentMethod(value) ? value : 'card';
}

/** GET users/me/payments → MyPayment () */
export function toMyPayment(
  order: OrdersRow,
  items: OrderItemsRow[],
): MyPayment {
  const orEmpty = (v: string | null) => v ?? '';
  return {
    id: order.id,
    orderId: order.id,
    status: toPaymentStatus(orEmpty(order.status)),
    paymentMethod: toPaymentMethod(orEmpty(order.payment_method)),
    itemCount: items.length,
    representativeItem: items.map((item) => ({
      productName: orEmpty(item.product_name),
      imageUrl: item.image_url,
    })),
    subtotal: order.subtotal ?? 0,
    shippingFee: order.shipping_fee ?? 0,
    discount: order.discount ?? 0,
    total: order.total ?? 0,
    currency: 'KRW',
    createdAt: orEmpty(order.created_at),
    paidAt: order.paid_at,
  };
}

/**
 * taste_profiles.recommended_product_ids 를 ID 배열로 파싱합니다.
 * JSON 배열과 쉼표 구분을 모두 허용합니다 ().
 */
export function parseRecommendedProductIds(text: string | null): string[] {
  if (!text) return [];
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.startsWith('[')) {
    try {
      const parsed: unknown = JSON.parse(trimmed);
      if (Array.isArray(parsed)) {
        return parsed.filter((v): v is string => typeof v === 'string');
      }
    } catch {
      return [];
    }
    return [];
  }
  return trimmed
    .split(',')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}
