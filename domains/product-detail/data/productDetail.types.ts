export type { LivePod } from '@/domains/pods/pods.types';

export type ProductTip = {
  id: string;
  title: string;
  content: string;
};

// 상품 상세 정보 표에 사용할 타입
export type ProductBasicInfo = {
  contentGuide?: string; // 구성·내용량
  ingredients?: string; // 원재료
  allergyInfo?: string; // 알레르기 안내
  storageMethod?: string; // 보관 방법
  shippingInfo?: string; // 배송 안내
  notice?: string; // 추가 안내
};

// 상품 설명 전체에 사용할 타입
export type ProductDescriptionData = {
  // 작물 이야기
  farmName?: string;
  farmInfo?: string;
  imageUrl?: string;

  // 상품 상세 정보
  basicInfo?: ProductBasicInfo;

  // 작물 활용 팁
  tips: ProductTip[];
};

export type ProductDetail = {
  catalogId?: string;
  isPurchasable?: boolean;
  id: string;
  name: string;
  category: string;
  images: string[];
  farmName?: string;
  unit?: string;

  // 제안 계약: 화면에 표시할 최종 금액.
  // discountRate로 다시 할인 계산하지 않습니다.
  price: number | null;
  discountRate?: number;
  isSample: boolean;

  description: ProductDescriptionData;
};

export type ProductGalleryProps = {
  name: string;
  images: ProductDetail['images'];
};
