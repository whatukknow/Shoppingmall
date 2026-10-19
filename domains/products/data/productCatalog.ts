/** 상품목록 화면을 위한 시안용 예시 데이터입니다. 실제 판매 정보가 아닙니다. */
export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  image?: string;
  /** 화면 구성 확인용 예시 금액이며 실제 가격이 아닙니다. */
  samplePrice: number;
};

export const productCatalog: CatalogProduct[] = [
  { id: 'mandarin', name: '귤', category: '과일', image: '/uploads/images/products/mandarin.png', samplePrice: 3900 },
  { id: 'apple', name: '사과', category: '과일', image: '/uploads/images/home/products/apple.png', samplePrice: 4900 },
  { id: 'grapes', name: '적포도', category: '과일', image: '/uploads/images/home/products/grapes.png', samplePrice: 6900 },
  { id: 'strawberry', name: '딸기', category: '과일', image: '/uploads/images/products/strawberry.png', samplePrice: 6500 },
  { id: 'tomato', name: '토마토', category: '채소', image: '/uploads/images/products/tomatoes.png', samplePrice: 4500 },
  { id: 'dragon-fruit', name: '용과', category: '과일', image: '/uploads/images/products/illustration-dragon-fruit.png', samplePrice: 5900 },
  { id: 'peach', name: '복숭아', category: '과일', image: '/uploads/images/products/illustration-peach.png', samplePrice: 6900 },
  { id: 'fried-egg', name: '계란 프라이', category: '식재료 예시', image: '/uploads/images/products/illustration-fried-egg.png', samplePrice: 2500 },
];
