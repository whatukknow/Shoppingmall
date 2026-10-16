/** 상품목록 화면을 위한 시안용 예시 데이터입니다. 실제 판매 정보가 아닙니다. */
export type CatalogProduct = {
  id: string;
  name: string;
  category: string;
  image: string;
  /** 화면 구성 확인용 예시 금액이며 실제 가격이 아닙니다. */
  samplePrice: number;
};

export const productCatalog: CatalogProduct[] = [
  { id: 'mandarin', name: '귤', category: '과일', image: '/images/products/mandarin.png', samplePrice: 3900 },
  { id: 'apple', name: '사과', category: '과일', image: '/images/products/apple.png', samplePrice: 4900 },
  { id: 'eggplants', name: '가지 모음', category: '채소', image: '/images/products/eggplants.png', samplePrice: 3500 },
  { id: 'dragon-fruit', name: '용과', category: '과일', image: '/images/products/dragon-fruit.png', samplePrice: 5900 },
  { id: 'peach', name: '복숭아', category: '과일', image: '/images/products/peach.png', samplePrice: 6900 },
  { id: 'raspberry', name: '산딸기', category: '과일', image: '/images/products/raspberry.png', samplePrice: 7500 },
  { id: 'strawberry', name: '딸기', category: '과일', image: '/images/products/strawberry.png', samplePrice: 6500 },
  { id: 'dragon-fruit-cut', name: '용과 단면', category: '과일', image: '/images/products/dragon-fruit-cut.png', samplePrice: 5900 },
  { id: 'fried-egg', name: '프라이드 에그', category: '식재료 예시', image: '/images/products/fried-egg.png', samplePrice: 2500 },
  { id: 'cherry', name: '체리', category: '과일', image: '/images/products/cherry.png', samplePrice: 7900 },
  { id: 'radicchio', name: '붉은 잎채소', category: '채소', image: '/images/products/radicchio.png', samplePrice: 3900 },
  { id: 'tomato', name: '토마토', category: '채소', image: '/images/products/tomato.png', samplePrice: 4500 },
  { id: 'red-bell-pepper', name: '빨강 파프리카', category: '채소', image: '/images/products/red-bell-pepper.png', samplePrice: 3200 },
  { id: 'persimmon', name: '감', category: '과일', image: '/images/products/persimmon.png', samplePrice: 4200 },
];
