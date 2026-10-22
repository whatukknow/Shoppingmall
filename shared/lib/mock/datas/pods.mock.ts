import type { Pod, PodStatus, PodSummary } from '@/domains/pods/pods.types';

const IMAGES = '/uploads/images/home/products';

const DEADLINE_LABELS = ['오늘 마감', 'D-1', 'D-2', 'D-3'] as const;
const OPTION_LABELS = ['1팩 · 300g', '1봉 · 500g', '1상자 · 400g'] as const;

type ProductSeed = { id: string; num: string; name: string; image: string };

// 상품 목업(shared/lib/mock/datas/products.mock.ts)의 id·이름·이미지와 일치하는 씨앗입니다.
const productSeeds: ProductSeed[] = [
  { id: 'pc-001', num: '001', name: '달콤한 참외', image: 'korean-melon.png' },
  { id: 'pc-002', num: '002', name: '방울토마토', image: 'tomatoes.png' },
  { id: 'pc-003', num: '003', name: '노란 멜론', image: 'honeydew-melon.png' },
  { id: 'pc-004', num: '004', name: '늙은 호박', image: 'pumpkin.png' },
  { id: 'pc-005', num: '005', name: '제주 귤', image: 'orange.png' },
  { id: 'pc-006', num: '006', name: '거봉 포도', image: 'grapes.png' },
  { id: 'pc-007', num: '007', name: '딸기 팩', image: 'strawberry.png' },
  { id: 'pc-008', num: '008', name: '양파 3개', image: 'onion.png' },
  { id: 'pc-009', num: '009', name: '양배추', image: 'cabbage.png' },
  { id: 'pc-010', num: '010', name: '대파 다발', image: 'scallion.png' },
  { id: 'pc-011', num: '011', name: '완두콩', image: 'peas.png' },
  {
    id: 'pc-012',
    num: '012',
    name: '방울양배추',
    image: 'brussels-sprouts.png',
  },
  { id: 'pc-013', num: '013', name: '사과 2입', image: 'apple.png' },
  { id: 'pc-014', num: '014', name: '감귤 팩', image: 'mandarin.png' },
  { id: 'pc-015', num: '015', name: '통수박', image: 'watermelon.png' },
];

/** 상품 하나에 마감 임박순으로 정렬된 팟 2~4개를 만듭니다 (규칙 기반으로 항상 같은 값). */
function buildProductPods(seed: ProductSeed, productIndex: number): Pod[] {
  const count = 2 + (productIndex % 3);
  return Array.from({ length: count }, (_, j) => {
    // 짝수 상품의 마지막 팟은 모집 완료 상태로 둡니다.
    const status: PodStatus =
      j === count - 1 && productIndex % 2 === 0 ? 'close' : 'open';
    const current = status === 'close' ? 4 : 1 + ((j + productIndex) % 3);
    const target = status === 'close' ? 4 : current + 1 + (j % 2);
    return {
      id: `pp-${seed.num}-${j + 1}`,
      productName: seed.name,
      imageUrl: `${IMAGES}/${seed.image}`,
      optionLabel: OPTION_LABELS[j % OPTION_LABELS.length],
      currentCount: current,
      targetCount: target,
      deadlineLabel: DEADLINE_LABELS[j % DEADLINE_LABELS.length],
      status,
    } satisfies Pod;
  });
}

const productListPods: Pod[][] = productSeeds.map(buildProductPods);

/** 홈 인기 소분팟 항목(bests)입니다. productId 는 상품 목업과 이름 기준으로 맞춥니다. */
const pod = (
  id: string,
  productId: string,
  productName: string,
  image: string,
  currentCount: number,
  targetCount: number,
  deadlineLabel: string,
): PodSummary => ({
  id,
  productId,
  productName,
  imageUrl: `${IMAGES}/${image}`,
  currentCount,
  targetCount,
  deadlineLabel,
});

const pods: PodSummary[] = [
  pod(
    'pod-001',
    'pc-001',
    '달콤한 참외 5kg 소분',
    'korean-melon.png',
    2,
    4,
    '오늘 마감',
  ),
  pod(
    'pod-002',
    'pc-002',
    '방울토마토 2kg 소분',
    'tomatoes.png',
    3,
    5,
    '오늘 마감',
  ),
  pod(
    'pod-003',
    'pc-003',
    '노란 멜론 3입 소분',
    'honeydew-melon.png',
    1,
    4,
    'D-1',
  ),
  pod('pod-004', 'pc-004', '늙은 호박 4입 소분', 'pumpkin.png', 4, 6, 'D-1'),
  pod('pod-005', 'pc-005', '제주 귤 10kg 소분', 'orange.png', 5, 8, 'D-2'),
  pod('pod-006', 'pc-006', '거봉 포도 2kg 소분', 'grapes.png', 2, 5, 'D-2'),
  pod(
    'pod-007',
    'pc-007',
    '딸기 팩 3입 소분',
    'strawberry.png',
    6,
    6,
    '마감 임박',
  ),
  pod('pod-008', 'pc-008', '양파 10kg 소분', 'onion.png', 3, 6, 'D-3'),
  pod('pod-009', 'pc-009', '양배추 5통 소분', 'cabbage.png', 4, 6, 'D-4'),
  pod('pod-010', 'pc-015', '통수박 3통 소분', 'watermelon.png', 1, 5, 'D-5'),
];

type PodRegistry = Record<`${'GET' | 'POST' | 'DELETE'} ${string}`, string>;

const listResponse = (list: Pod[]) =>
  JSON.stringify({ data: { list, total: list.length, limit: 10, offset: 0 } });

/** 상품별 팟 목록·생성·참여·참여취소 등록부를 만듭니다. */
function buildProductPodsData(): PodRegistry {
  const registry: PodRegistry = {};

  for (let i = 0; i < productSeeds.length; i += 1) {
    const seed = productSeeds[i];
    const podsOfProduct = productListPods[i];
    const openPods = podsOfProduct.filter((item) => item.status === 'open');

    registry[`GET products/${seed.id}/pods?status=all&sort=deadline`] =
      listResponse(podsOfProduct);
    registry[`GET products/${seed.id}/pods?status=open&sort=deadline`] =
      listResponse(openPods);
    registry[`POST products/${seed.id}/pods`] = JSON.stringify({
      data: {
        id: `pp-${seed.num}-new`,
        productName: seed.name,
        imageUrl: `${IMAGES}/${seed.image}`,
        optionLabel: OPTION_LABELS[0],
        currentCount: 1,
        targetCount: 2,
        deadlineLabel: DEADLINE_LABELS[0],
        status: 'open',
      } satisfies Pod,
    });

    for (const item of podsOfProduct) {
      registry[`POST pods/${item.id}/applications`] = JSON.stringify({
        data: { ...item, currentCount: item.currentCount + 1 },
      });
      registry[`DELETE pods/${item.id}/applications/me`] = JSON.stringify({
        data: { ...item, currentCount: Math.max(0, item.currentCount - 1) },
      });
    }

    // 목업으로 새로 만든 팟에도 참여·취소 키를 제공합니다.
    registry[`POST pods/pp-${seed.num}-new/applications`] = JSON.stringify({
      data: {
        id: `pp-${seed.num}-new`,
        productName: seed.name,
        imageUrl: `${IMAGES}/${seed.image}`,
        optionLabel: OPTION_LABELS[0],
        currentCount: 2,
        targetCount: 2,
        deadlineLabel: DEADLINE_LABELS[0],
        status: 'open',
      } satisfies Pod,
    });
    registry[`DELETE pods/pp-${seed.num}-new/applications/me`] = JSON.stringify(
      {
        data: {
          id: `pp-${seed.num}-new`,
          productName: seed.name,
          imageUrl: `${IMAGES}/${seed.image}`,
          optionLabel: OPTION_LABELS[0],
          currentCount: 0,
          targetCount: 2,
          deadlineLabel: DEADLINE_LABELS[0],
          status: 'open',
        } satisfies Pod,
      },
    );
  }

  return registry;
}

export const podsData: PodRegistry = {
  'GET pods?status=open&sort=best': JSON.stringify({
    data: {
      list: pods,
      total: 10,
      limit: 10,
      offset: 0,
    },
  }),
  ...buildProductPodsData(),
};
