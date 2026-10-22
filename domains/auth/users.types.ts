// 회원(users/me) 계열 API 가 쓰는 데이터 모양

// 회원 정보 (GET users/me)
export type User = {
  id: string;
  name: string;
  email: string;
  defaultAddress: string;
  recipientName: string;
  recipientPhone: string;
  postalCode: string;
  recipientAddress: string;
  recipientAddressDetail: string;
  entranceInstructions: string;
  hasTasteProfile: boolean;
};

// 화면 쪽 취향 프로필 (camelCase)
export type TasteProfile = {
  source: string;
  variant: string;
  nickname: string;
  birthYear: string;
  birthMd: string;
  gender: string;
  animal: string;
  element: string;
  sunday: string;
  fridge: string;
  items: string; // JSON 문자열
  kit: string; // JSON 문자열
  consent: boolean;
  qualityFlags: string; // JSON 문자열
};

// API 요청 본문 (snake_case)
export type TasteProfileRequest = {
  source: string;
  variant: string;
  nickname: string;
  birth_year: string;
  birth_md: string;
  gender: string;
  animal: string;
  element: string;
  sunday: string;
  fridge: string;
  items: string;
  kit: string;
  consent: boolean;
  quality_flags: string;
};

// 내 소분 팟 신청 내역
export type MyPodApplication = {
  id: string;
  podId: string;
  productId: string;
  productName: string;
  optionLabel: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  status: 'pending' | 'accepted';
  paymentEligibility: 'not-ready' | 'ready' | 'paid' | 'expired';
  podStatus: 'recruiting' | 'matched' | 'closed' | 'cancelled';
  applicantCount: number;
  capacity: number;
  deadlineAt: string;
  appliedAt: string;
};

// 내 소분 팟 신청 상태 필터 (open = 모집 중 pod 만)
export type MyPodApplicationStatus = 'all' | 'open' | 'close';

// 내 결제 내역
export type MyPayment = {
  id: string;
  orderId: string;
  status: 'pending' | 'paid' | 'failed' | 'cancelled';
  paymentMethod: 'card' | 'naverpay' | 'kakaopay' | 'tosspay';
  itemCount: number;
  representativeItem: {
    productName: string;
    imageUrl: string | null;
  }[];
  subtotal: number;
  shippingFee: number;
  discount: number;
  total: number;
  currency: string;
  createdAt: string;
  paidAt: string | null;
};
