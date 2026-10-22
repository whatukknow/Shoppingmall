/** 추천 상품 API(랜덤·사주) 응답 항목입니다. */
export type RecommendedProduct = {
  id: string;
  name: string;
  imageUrl: string;
};

/** 홈 캐러셀 카드의 상품 정보입니다. */
export type HomeCardItem = {
  id: string;
  name: string;
  imageUrl: string;
  description?: string;
};

/** 상품 둘러보기 목록 항목입니다. */
export type CatalogCardItem = {
  id: string;
  name: string;
  imageUrl: string;
};
