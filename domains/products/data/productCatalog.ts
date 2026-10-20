/** 상품 목록과 상세 화면에 전달할 데이터 형태입니다. */
export type CatalogProduct = {
  /** API가 제공할 때만 상세 경로와 연결하는 실제 상품 ID입니다. */
  id?: string | number;
  name: string;
  category: string;
  image?: string;
  /** 상품 가격입니다. */
  price: number;
};
