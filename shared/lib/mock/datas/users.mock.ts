import { MOCK_USER_SCENARIO } from '../mockScenario';
import { mockError } from '../fetchMock';

// 비회원(guest)이면 401 마커 응답
const requiresLogin = MOCK_USER_SCENARIO === 'guest';
const err401 = mockError(401, '로그인이 필요해요.');

// 예시 회원 (auth.signin 목업과 같은 사람)
const memberBase = {
  id: 'member-1',
  name: '정은',
  email: 'jeongeun@example.com',
  defaultAddress: '경기도 시흥시 정왕동',
  recipientName: '정은',
  recipientPhone: '010-1234-5678',
  postalCode: '14984',
  recipientAddress: '경기도 시흥시 정왕로93',
  recipientAddressDetail: '101동 203호',
  entranceInstructions: '현관 비밀번호 1234',
};

// 온보딩에서 저장한 예시 취향 프로필 (camelCase)
const tasteProfile = {
  source: 'onboarding',
  variant: 'v1',
  nickname: '정은',
  birthYear: '1995',
  birthMd: '0314',
  gender: 'F',
  animal: 'wood-pig',
  element: 'wood',
  sunday: 'window-sun',
  fridge: 'always-full',
  items: JSON.stringify(['vegetables', 'fruit']),
  kit: JSON.stringify(['fresh', 'cheap']),
  consent: true,
  qualityFlags: JSON.stringify(['cheap', 'fresh']),
};

const IMAGES = '/uploads/images/home/products';

// 내 소분 팟 신청 내역 (최신 신청순). 결제 가능 2건은 payment.mock 의 pod-1·pod-2 와 동일하다.
const podApplications = [
  {
    id: 'pa-1',
    podId: 'pod-2',
    productId: 'pc-002',
    productName: '시흥 스테비아 토마토',
    optionLabel: '1팩 · 500g',
    imageUrl: `${IMAGES}/tomatoes.png`,
    quantity: 1,
    unitPrice: 7900,
    status: 'accepted',
    paymentEligibility: 'ready',
    podStatus: 'matched',
    applicantCount: 4,
    capacity: 4,
    deadlineAt: '2026-10-22T09:00:00.000Z',
    appliedAt: '2026-10-21T09:00:00.000Z',
  },
  {
    id: 'pa-2',
    podId: 'pod-1',
    productId: 'pc-105',
    productName: '용인 블루베리',
    optionLabel: '1팩 · 125g',
    imageUrl: `${IMAGES}/illustration-blueberries.png`,
    quantity: 1,
    unitPrice: 4900,
    status: 'accepted',
    paymentEligibility: 'ready',
    podStatus: 'matched',
    applicantCount: 3,
    capacity: 3,
    deadlineAt: '2026-10-21T15:00:00.000Z',
    appliedAt: '2026-10-20T14:00:00.000Z',
  },
  {
    id: 'pa-3',
    podId: 'pod-11',
    productId: 'pc-003',
    productName: '노란 멜론',
    optionLabel: '1개',
    imageUrl: `${IMAGES}/honeydew-melon.png`,
    quantity: 2,
    unitPrice: 6500,
    status: 'pending',
    paymentEligibility: 'not-ready',
    podStatus: 'recruiting',
    applicantCount: 2,
    capacity: 4,
    deadlineAt: '2026-10-24T09:00:00.000Z',
    appliedAt: '2026-10-19T10:00:00.000Z',
  },
  {
    id: 'pa-4',
    podId: 'pod-12',
    productId: 'pc-011',
    productName: '완두콩',
    optionLabel: '200g',
    imageUrl: `${IMAGES}/peas.png`,
    quantity: 1,
    unitPrice: 3200,
    status: 'accepted',
    paymentEligibility: 'paid',
    podStatus: 'closed',
    applicantCount: 4,
    capacity: 4,
    deadlineAt: '2026-10-16T09:00:00.000Z',
    appliedAt: '2026-10-15T10:00:00.000Z',
  },
  {
    id: 'pa-5',
    podId: 'pod-13',
    productId: 'pc-005',
    productName: '제주 귤',
    optionLabel: '1망 · 2kg',
    imageUrl: `${IMAGES}/orange.png`,
    quantity: 1,
    unitPrice: 9900,
    status: 'accepted',
    paymentEligibility: 'expired',
    podStatus: 'closed',
    applicantCount: 4,
    capacity: 4,
    deadlineAt: '2026-10-11T09:00:00.000Z',
    appliedAt: '2026-10-10T10:00:00.000Z',
  },
  {
    id: 'pa-6',
    podId: 'pod-14',
    productId: 'pc-013',
    productName: '사과 2입',
    optionLabel: '2입',
    imageUrl: `${IMAGES}/apple.png`,
    quantity: 3,
    unitPrice: 4200,
    status: 'pending',
    paymentEligibility: 'not-ready',
    podStatus: 'recruiting',
    applicantCount: 1,
    capacity: 3,
    deadlineAt: '2026-10-25T09:00:00.000Z',
    appliedAt: '2026-10-08T10:00:00.000Z',
  },
];

const listByStatus = (status: string) => {
  const list =
    status === 'open'
      ? podApplications.filter((item) => item.podStatus === 'recruiting')
      : status === 'close'
        ? podApplications.filter((item) => item.podStatus !== 'recruiting')
        : podApplications;
  return { list, total: list.length, limit: 0, offset: 0 };
};

// 내 결제 내역 (paid 2, pending 1)
const payments = [
  {
    id: 'pay-1',
    orderId: 'ord-1',
    status: 'paid',
    paymentMethod: 'card',
    itemCount: 2,
    representativeItem: [
      {
        productName: '용인 블루베리',
        imageUrl: `${IMAGES}/illustration-blueberries.png`,
      },
      {
        productName: '시흥 스테비아 토마토',
        imageUrl: `${IMAGES}/tomatoes.png`,
      },
    ],
    subtotal: 12800,
    shippingFee: 3000,
    discount: 0,
    total: 15800,
    currency: 'KRW',
    createdAt: '2026-10-18T12:00:00.000Z',
    paidAt: '2026-10-18T12:01:00.000Z',
  },
  {
    id: 'pay-2',
    orderId: 'ord-2',
    status: 'paid',
    paymentMethod: 'naverpay',
    itemCount: 1,
    representativeItem: [
      {
        productName: '완두콩',
        imageUrl: `${IMAGES}/peas.png`,
      },
    ],
    subtotal: 3200,
    shippingFee: 0,
    discount: 0,
    total: 3200,
    currency: 'KRW',
    createdAt: '2026-10-16T11:00:00.000Z',
    paidAt: '2026-10-16T11:01:00.000Z',
  },
  {
    id: 'pay-3',
    orderId: 'ord-3',
    status: 'pending',
    paymentMethod: 'kakaopay',
    itemCount: 2,
    representativeItem: [
      {
        productName: '노란 멜론',
        imageUrl: `${IMAGES}/honeydew-melon.png`,
      },
      {
        productName: '사과 2입',
        imageUrl: `${IMAGES}/apple.png`,
      },
    ],
    subtotal: 25600,
    shippingFee: 3000,
    discount: 2000,
    total: 26600,
    currency: 'KRW',
    createdAt: '2026-10-22T08:00:00.000Z',
    paidAt: null,
  },
];

// 시나리오별 응답: guest 면 전부 401
const stringOr401 = (value: unknown) =>
  requiresLogin ? err401 : JSON.stringify(value);

const podApplicationList = (status: string) =>
  requiresLogin ? err401 : JSON.stringify({ data: listByStatus(status) });

const paymentList = (status?: string) => {
  if (requiresLogin) return err401;
  const list = status
    ? payments.filter((item) => item.status === status)
    : payments;
  return JSON.stringify({
    data: { list, total: list.length, limit: 20, offset: 0 },
  });
};

type UsersDataEntry = Record<string, string>;

// 목업 등록부: users/me 계열 엔드포인트
export const usersData: UsersDataEntry = {
  'GET users/me': requiresLogin
    ? err401
    : JSON.stringify({
        data: {
          ...memberBase,
          hasTasteProfile: MOCK_USER_SCENARIO === 'needs-taste' ? false : true,
        },
      }),
  'PUT users/me/taste-profile': stringOr401({ data: tasteProfile }),
  'GET users/me/taste-profile': stringOr401({ data: tasteProfile }),
  'GET users/me/pod-applications?status=all&sort=latest':
    podApplicationList('all'),
  'GET users/me/pod-applications?status=open&sort=latest':
    podApplicationList('open'),
  'GET users/me/pod-applications?status=close&sort=latest':
    podApplicationList('close'),
  'GET users/me/payments': paymentList(),
  'GET users/me/payments?status=paid': paymentList('paid'),
  'GET users/me/payments?status=pending': paymentList('pending'),
};
