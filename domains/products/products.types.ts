/** 상품 둘러보기 목록 항목입니다. */
export type ProductListItem = {
  id: string;
  name: string;
  imageUrl: string;
  description: string;
  category: string;
  price: number;
};

/** 상품 목록 정렬 기준입니다. latest 는 최신 등록순입니다. */
export type ProductSort = 'latest' | 'asc' | 'desc';

/** 상품 상세 정보 표의 각 항목입니다. */
export type ProductDetailBasicInfo = {
  contentGuide: string;
  ingredients: string;
  allergyInfo: string;
  storageMethod: string;
  shippingInfo: string;
  notice: string;
};

/** 상품 활용 팁 항목입니다. */
export type ProductDetailTip = {
  id: string;
  title: string;
  content: string;
};

/** 상품 상세 응답 본문입니다. */
export type ProductDetailResponse = {
  id: string;
  name: string;
  category: string;
  images: string[];
  farmName: string;
  price: number;
  unit: string;
  discountRate: number;
  description: string;
  farmInfo: string;
  farmImageUrl: string;
  basicInfo: ProductDetailBasicInfo;
  tips: ProductDetailTip[];
};
