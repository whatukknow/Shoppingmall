type HomeRecommendProduct = { id: string; name: string; imageUrl: string };

const IMAGES = '/uploads/images/home/products';

const p = (id: string, name: string, image: string): HomeRecommendProduct => ({
  id,
  name,
  imageUrl: `${IMAGES}/${image}`,
});

// 기존 목업 상품명·일러스트 경로를 재사용합니다.
// 랜덤 추천은 상품 목록과 같은 상품(id)을 순서만 섞어 보여줍니다.
const randomProducts: HomeRecommendProduct[] = [
  p('pc-007', '딸기 팩', 'strawberry.png'),
  p('pc-001', '달콤한 참외', 'korean-melon.png'),
  p('pc-013', '사과 2입', 'apple.png'),
  p('pc-010', '대파 다발', 'scallion.png'),
  p('pc-004', '늙은 호박', 'pumpkin.png'),
  p('pc-015', '통수박', 'watermelon.png'),
  p('pc-002', '방울토마토', 'tomatoes.png'),
  p('pc-011', '완두콩', 'peas.png'),
  p('pc-005', '제주 귤', 'orange.png'),
  p('pc-008', '양파 3개', 'onion.png'),
  p('pc-014', '감귤 팩', 'mandarin.png'),
  p('pc-003', '노란 멜론', 'honeydew-melon.png'),
  p('pc-012', '방울양배추', 'brussels-sprouts.png'),
  p('pc-006', '거봉 포도', 'grapes.png'),
  p('pc-009', '양배추', 'cabbage.png'),
];

const aiProducts: HomeRecommendProduct[] = [
  p('pc-101', '스테이크용 소고기', 'illustration-beef-steak.png'),
  p('pc-102', '유정란 10구', 'illustration-fried-egg.png'),
  p('pc-103', '돼지 목살', 'illustration-pork-steak.png'),
  p('pc-104', '닭다리살', 'illustration-chicken-drumstick.png'),
  p('pc-105', '블루베리 팩', 'illustration-blueberries.png'),
];

const randomListResponse = {
  list: randomProducts,
  total: 15,
  limit: 15,
  offset: 0,
};

const aiListResponse = {
  list: aiProducts,
  total: 5,
  limit: 5,
  offset: 0,
};

// 홈 상품 목업: 공통 응답 구조는 유지합니다.
export const homeData: Record<`GET ${string}`, string> = {
  'GET products?type=random': JSON.stringify({
    data: randomListResponse,
  }),
  'GET users/me/product-recommendations': JSON.stringify({
    data: aiListResponse,
  }),
};
