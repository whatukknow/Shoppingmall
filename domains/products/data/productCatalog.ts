/** 상품목록 화면을 위한 시안용 예시 데이터입니다. 실제 판매 정보가 아닙니다. */
export type CatalogProduct = {
  /** API가 제공할 때만 상세 경로와 연결하는 실제 상품 ID입니다. */
  id?: string | number;
  name: string;
  category: string;
  image?: string;
  /** 화면 구성 확인용 예시 금액이며 실제 가격이 아닙니다. */
  samplePrice: number;
};

export const productCatalog: CatalogProduct[] = [
  { name: '귤', category: '과일', image: '/uploads/images/products/mandarin.png', samplePrice: 3900 },
  { name: '사과', category: '과일', image: '/uploads/images/home/products/apple.png', samplePrice: 4900 },
  { name: '적포도', category: '과일', image: '/uploads/images/home/products/grapes.png', samplePrice: 6900 },
  { name: '딸기', category: '과일', image: '/uploads/images/products/strawberry.png', samplePrice: 6500 },
  { name: '토마토', category: '채소', image: '/uploads/images/products/tomatoes.png', samplePrice: 4500 },
  { name: '용과', category: '과일', image: '/uploads/images/products/illustration-dragon-fruit.png', samplePrice: 5900 },
  { name: '복숭아', category: '과일', image: '/uploads/images/products/illustration-peach.png', samplePrice: 6900 },
  { name: '계란 프라이', category: '식재료 예시', image: '/uploads/images/products/illustration-fried-egg.png', samplePrice: 2500 },
];
