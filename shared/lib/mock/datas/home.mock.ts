import type { HomeProduct } from '@/domains/home/data/homeProducts';

// 테스트 전환용: 값을 바꿔('guest' | 'ai' | 'needs-taste') 홈 추천 모드를 확인한다.
export const HOME_RECOMMENDATION_MOCK_SCENARIO: 'guest' | 'ai' | 'needs-taste' =
  'guest';

const statusByScenario = {
  guest: { isLoggedIn: false, hasTasteProfile: false },
  ai: { isLoggedIn: true, hasTasteProfile: true },
  'needs-taste': { isLoggedIn: true, hasTasteProfile: false },
} as const;

const p = (
  name: string,
  description: string,
  illustration: HomeProduct['illustration'],
): HomeProduct => ({ name, description, illustration });

const randomProducts: HomeProduct[] = [
  p('달콤한 참외', '아침에 먹기 좋은 달큰한 참외', 'koreanMelon'),
  p('방울토마토', '새콤달콤한 맛의 방울토마토', 'tomatoes'),
  p('노란 멜론', '부드럽고 향긋한 여름 멜론', 'melon'),
  p('늙은 호박', '죽과 찜에 어울리는 고소한 호박', 'pumpkin'),
  p('제주 귤', '제주 햇살의 달콤한 귤', 'orange'),
  p('거봉 포도', '알맹이가 통통한 거봉', 'grapes'),
  p('딸기 팩', '향이 진한 방울딸기', 'strawberry'),
  p('양파 3개', '요리에 빠질 수 없는 기본 양파', 'onion'),
  p('양배추', '아삭하고 신선한 통양배추', 'cabbage'),
  p('대파 다발', '국과 볶음에 좋은 대파', 'scallion'),
  p('완두콩', '달큰한 봄 완두콩', 'peas'),
  p('방울양배추', '고소하고 담백한 방울양배추', 'brusselsSprouts'),
  p('사과 2입', '아삭하고 달콤한 가을 사과', 'apple'),
  p('감귤 팩', '새콤달콤한 제주 감귤', 'mandarin'),
  p('통수박', '시원하고 달콤한 여름 수박', 'watermelon'),
];

const aiProducts: HomeProduct[] = [
  p('스테이크용 소고기', '집에서 즐기는 두툼한 소고기 스테이크', 'beefSteak'),
  p('반숙 계란후라이', '고소한 노른자의 계란후라이', 'friedEgg'),
  p('돼지 목살 스테이크', '육즙이 살아있는 돼지 스테이크', 'porkSteak'),
  p('닭다리살 구이', '촉촉하게 익은 닭다리살', 'chickenDrumstick'),
  p('블루베리 팩', '알이 굵은 생블루베리', 'blueberries'),
];

// 홈 상품 목업: 공통 응답 구조는 유지합니다.
export const homeData: Record<`GET ${string}`, string> = {
  'GET home/share-products': JSON.stringify([]),
  'GET home/popular-products': JSON.stringify([]),
  'GET home/recommendations/random': JSON.stringify(randomProducts),
  'GET home/recommendations/ai': JSON.stringify(aiProducts),
  'GET home/recommendations/status': JSON.stringify(
    statusByScenario[HOME_RECOMMENDATION_MOCK_SCENARIO],
  ),
};
