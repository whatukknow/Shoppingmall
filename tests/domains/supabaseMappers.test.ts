import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  toImageUrl,
  toDeadlineLabel,
  toListResponse,
  toRange,
} from '@/shared/lib/mapper.utils';
import {
  toProductListItem,
  toProductDetail,
  toRecommendedProduct,
} from '@/domains/products/products.mapper';
import { toPodStatus, toPodSummary, toPod } from '@/domains/pods/pods.mapper';
import {
  toUser,
  toMyPayment,
  parseRecommendedProductIds,
} from '@/domains/auth/users.mapper';
import type { Database } from '@/shared/lib/supabase/database.types';

/** 테스트용 씨앗: minimal Row 타입 캐스팅 */
function row<T>(partial: Partial<T>): T {
  return partial as T;
}

describe('toImageUrl', () => {
  it('external_url 이 있으면 그대로 반환한다', () => {
    const upload = row<Database['public']['Tables']['uploads']['Row']>({
      external_url: 'https://cdn.example.com/a.png',
      location: 'illustrations/apple.png',
    });
    assert.equal(toImageUrl(upload), 'https://cdn.example.com/a.png');
  });

  it('external_url 이 없으면 /uploads/ + location 을 반환한다', () => {
    const upload = row<Database['public']['Tables']['uploads']['Row']>({
      external_url: null,
      location: 'illustrations/apple.png',
    });
    assert.equal(toImageUrl(upload), '/uploads/illustrations/apple.png');
  });
});

describe('toDeadlineLabel', () => {
  const now = new Date('2026-10-23T10:00:00+09:00');

  it('오늘 마감이면 "오늘 마감"', () => {
    assert.equal(
      toDeadlineLabel('2026-10-23T23:59:59+09:00', now),
      'Closes today',
    );
  });

  it('내일이면 D-1', () => {
    assert.equal(toDeadlineLabel('2026-10-24T23:59:59+09:00', now), 'D-1');
  });

  it('3일 뒤면 D-3', () => {
    assert.equal(toDeadlineLabel('2026-10-26T23:59:59+09:00', now), 'D-3');
  });

  it('기한이 지났으면 "마감"', () => {
    assert.equal(toDeadlineLabel('2026-10-22T23:59:59+09:00', now), 'Closed');
  });

  it('같은 날이라도 마감 시각이 지났으면 "마감"', () => {
    // now = 10:00, 마감 = 당일 09:00 → 이미 지남
    assert.equal(toDeadlineLabel('2026-10-23T09:00:00+09:00', now), 'Closed');
  });

  it('KST 기준 캘린더 일자로 비교한다 (서버 시간대가 달라도 동일)', () => {
    // '2026-10-11T15:00:00Z' = KST 2026-10-12 00:00
    // 서버가 UTC여도 KST 일자 기준으로 같은 날이므로 "오늘 마감"
    const nowUtc = new Date('2026-10-12T00:30:00Z');
    assert.equal(
      toDeadlineLabel('2026-10-11T15:00:00Z', nowUtc),
      'Closes today',
    );
  });
});

describe('toListResponse', () => {
  it('list/total/limit/offset 봉투를 만든다', () => {
    assert.deepEqual(toListResponse(['a', 'b'], 5, 2, 4), {
      list: ['a', 'b'],
      total: 5,
      limit: 2,
      offset: 4,
    });
  });
});

describe('toRange', () => {
  it('limit>0 이면 supabase range 인수를 만든다', () => {
    assert.deepEqual(toRange(10, 20), { from: 20, to: 29 });
  });

  it('limit 0 (전체) 이면 null 을 반환한다', () => {
    assert.equal(toRange(0, 20), null);
  });

  it('음수/비정수 limit·offset 은 정규화한다', () => {
    // limit 2.9 → 2, offset -1.5 → 0 → { from: 0, to: 1 }
    assert.deepEqual(toRange(2.9, -1.5), { from: 0, to: 1 });
  });
});

describe('toPodStatus', () => {
  const cases: [string | null, 'open' | 'close'][] = [
    ['recruiting', 'open'],
    ['matched', 'close'],
    ['confirmed', 'close'],
    ['closed', 'close'],
    ['cancelled', 'close'],
  ];
  for (const [dbStatus, expected] of cases) {
    it(`DB status ${dbStatus} → ${expected}`, () => {
      assert.equal(toPodStatus(dbStatus), expected);
    });
  }
  it('null 이면 close', () => {
    assert.equal(toPodStatus(null), 'close');
  });
});

describe('pods mapper', () => {
  type PodRow = Database['public']['Tables']['pods']['Row'];
  const podRow = row<PodRow>({
    id: 'pod-1',
    product_id: 'pc-001',
    member_count: 3,
    capacity: 5,
    portion_label: '1팩 · 300g',
    status: 'recruiting',
    recruit_deadline: '2026-10-25T00:00:00+09:00',
  });
  const NOW = new Date('2026-10-23T10:00:00+09:00');

  it('toPodSummary 는 필드를 매핑한다', () => {
    assert.deepEqual(toPodSummary(podRow, '달콤한 참외', '/img.png', NOW), {
      id: 'pod-1',
      productId: 'pc-001',
      productName: '달콤한 참외',
      imageUrl: '/img.png',
      currentCount: 3,
      targetCount: 5,
      deadlineLabel: 'D-2',
    });
  });

  it('toPod 는 optionLabel 과 status 를 추가한다', () => {
    assert.deepEqual(toPod(podRow, '달콤한 참외', '/img.png', NOW), {
      id: 'pod-1',
      productName: '달콤한 참외',
      imageUrl: '/img.png',
      optionLabel: '1팩 · 300g',
      currentCount: 3,
      targetCount: 5,
      deadlineLabel: 'D-2',
      status: 'open',
    });
  });
});

describe('products mapper', () => {
  type ProductsRow = Database['public']['Tables']['products']['Row'];
  const product = row<ProductsRow>({
    id: 'pc-001',
    name: '달콤한 참외',
    farm_name: '청송 농장',
    portion_label: '1팩 · 300g',
    portion_price: 12900,
    details: { summary: '달콤한 참외 요약', tips: ['tip1'] },
  });

  it('toProductListItem 은 필드를 매핑한다', () => {
    assert.deepEqual(toProductListItem(product, '/img.png', '과일'), {
      id: 'pc-001',
      name: '달콤한 참외',
      imageUrl: '/img.png',
      description: '달콤한 참외 요약',
      category: '과일',
      price: 12900,
    });
  });

  it('toProductDetail 은 없는 필드를 기본값으로 채운다', () => {
    const detail = toProductDetail(product, '과일', ['/a.png']);
    assert.equal(detail.discountRate, 0);
    assert.equal(detail.unit, '1팩 · 300g');
    assert.equal(detail.price, 12900);
    assert.equal(detail.farmName, '청송 농장');
    assert.deepEqual(detail.images, ['/a.png']);
    assert.equal(detail.farmInfo, '');
    assert.equal(detail.farmImageUrl, '/a.png');
    assert.deepEqual(detail.basicInfo, {
      contentGuide: '',
      ingredients: '',
      allergyInfo: '',
      storageMethod: '',
      shippingInfo: '',
      notice: '',
    });
    assert.deepEqual(detail.tips, []);
  });

  it('details 가 null 이면 description 을 빈 문자열로 채운다', () => {
    const p = row<ProductsRow>({ ...product, details: null });
    assert.equal(toProductListItem(p, '/img.png', '과일').description, '');
  });

  it('toRecommendedProduct 는 3필드만 매핑한다', () => {
    assert.deepEqual(toRecommendedProduct(product, '/img.png'), {
      id: 'pc-001',
      name: '달콤한 참외',
      imageUrl: '/img.png',
    });
  });
});

describe('users mapper', () => {
  type ProfilesRow = Database['public']['Tables']['profiles']['Row'];
  type OrdersRow = Database['public']['Tables']['orders']['Row'];
  type OrderItemsRow = Database['public']['Tables']['order_items']['Row'];

  const profile = row<ProfilesRow>({
    id: 'u1',
    display_name: '홍길동',
    email: 'hong@example.com',
  });

  it('toUser 는 최근 주소지를 최근 주문에서 합성한다', () => {
    const order = row<OrdersRow>({
      recipient_name: '홍길동',
      recipient_phone: '010-1111-2222',
      postal_code: '05151',
      recipient_address: '서울 강동구',
      recipient_address_detail: '101호',
      entrance_instructions: '1234',
    });
    assert.deepEqual(toUser(profile, order, true), {
      id: 'u1',
      name: '홍길동',
      email: 'hong@example.com',
      recipientName: '홍길동',
      recipientPhone: '010-1111-2222',
      postalCode: '05151',
      recipientAddress: '서울 강동구',
      recipientAddressDetail: '101호',
      entranceInstructions: '1234',
      defaultAddress: '서울 강동구 101호',
      hasTasteProfile: true,
    });
  });

  it('toUser 는 주문이 없으면 주소지를 빈 문자열로 채운다', () => {
    const user = toUser(profile, null, false);
    assert.equal(user.defaultAddress, '');
    assert.equal(user.recipientName, '');
    assert.equal(user.hasTasteProfile, false);
  });

  it('toMyPayment 는 주문 + 아이템을 매핑한다', () => {
    const order = row<OrdersRow>({
      id: 'ord-1',
      status: 'paid',
      payment_method: 'card',
      subtotal: 10000,
      base_shipping_fee: 2500,
      fresh_packaging_fee: 500,
      shipping_fee: 3000,
      discount: 1000,
      total: 12000,
      created_at: '2026-10-01T00:00:00+09:00',
      paid_at: '2026-10-01T01:00:00+09:00',
    });
    const items = [
      row<OrderItemsRow>({ product_name: '참외', image_url: '/a.png' }),
      row<OrderItemsRow>({ product_name: '토마토', image_url: null }),
    ];
    assert.deepEqual(toMyPayment(order, items), {
      id: 'ord-1',
      orderId: 'ord-1',
      status: 'paid',
      paymentMethod: 'card',
      itemCount: 2,
      representativeItem: [
        { productName: '참외', imageUrl: '/a.png' },
        { productName: '토마토', imageUrl: null },
      ],
      subtotal: 10000,
      shippingFee: 3000,
      discount: 1000,
      total: 12000,
      currency: 'KRW',
      createdAt: '2026-10-01T00:00:00+09:00',
      paidAt: '2026-10-01T01:00:00+09:00',
    });
  });

  it('toMyPayment 는 미지원 status/payment_method 를 기본값으로 대체한다', () => {
    const order = row<OrdersRow>({
      id: 'ord-2',
      status: 'weird_status',
      payment_method: 'bitcoin',
    });
    const payment = toMyPayment(order, []);
    assert.equal(payment.status, 'pending');
    assert.equal(payment.paymentMethod, 'card');
  });

  it('parseRecommendedProductIds 는 JSON 배열을 파싱한다', () => {
    assert.deepEqual(parseRecommendedProductIds('["pc-001","pc-002"]'), [
      'pc-001',
      'pc-002',
    ]);
  });

  it('parseRecommendedProductIds 는 쉼표 구분도 파싱한다', () => {
    assert.deepEqual(parseRecommendedProductIds('pc-001, pc-002 ,pc-003'), [
      'pc-001',
      'pc-002',
      'pc-003',
    ]);
  });

  it('parseRecommendedProductIds 는 null/빈값을 빈 배열로 한다', () => {
    assert.deepEqual(parseRecommendedProductIds(null), []);
    assert.deepEqual(parseRecommendedProductIds(''), []);
  });
});
