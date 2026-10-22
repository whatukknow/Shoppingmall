type CatalogItem = { id: string; name: string; imageUrl: string };

const IMAGES = '/uploads/images/home/products';

const p = (id: string, name: string, image: string): CatalogItem => ({
  id,
  name,
  imageUrl: `${IMAGES}/${image}`,
});

const catalogProducts: CatalogItem[] = [
  p('pc-001', '달콤한 참외', 'korean-melon.png'),
  p('pc-002', '방울토마토', 'tomatoes.png'),
  p('pc-003', '노란 멜론', 'honeydew-melon.png'),
  p('pc-004', '늙은 호박', 'pumpkin.png'),
  p('pc-005', '제주 귤', 'orange.png'),
  p('pc-006', '거봉 포도', 'grapes.png'),
  p('pc-007', '딸기 팩', 'strawberry.png'),
  p('pc-008', '양파 3개', 'onion.png'),
  p('pc-009', '양배추', 'cabbage.png'),
  p('pc-010', '대파 다발', 'scallion.png'),
  p('pc-011', '완두콩', 'peas.png'),
  p('pc-012', '방울양배추', 'brussels-sprouts.png'),
  p('pc-013', '사과 2입', 'apple.png'),
  p('pc-014', '감귤 팩', 'mandarin.png'),
  p('pc-015', '통수박', 'watermelon.png'),
];

// 상품 목록 목업: 공통 응답 구조는 유지합니다.
export const productsData: Record<`GET ${string}`, string> = {
  'GET products/list': JSON.stringify([]),
  'GET products?category=all': JSON.stringify({
    data: {
      list: catalogProducts,
      total: 15,
      limit: 15,
      offset: 0,
    },
  }),
};
