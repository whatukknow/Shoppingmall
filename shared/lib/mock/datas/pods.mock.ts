type PodSummaryItem = {
  id: string;
  productName: string;
  imageUrl: string;
  currentCount: number;
  targetCount: number;
  deadlineLabel: string;
};

const IMAGES = '/uploads/images/home/products';

const pod = (
  id: string,
  productName: string,
  image: string,
  currentCount: number,
  targetCount: number,
  deadlineLabel: string,
): PodSummaryItem => ({
  id,
  productName,
  imageUrl: `${IMAGES}/${image}`,
  currentCount,
  targetCount,
  deadlineLabel,
});

const pods: PodSummaryItem[] = [
  pod('pod-001', '달콤한 참외 5kg 소분', 'korean-melon.png', 2, 4, '오늘 마감'),
  pod('pod-002', '방울토마토 2kg 소분', 'tomatoes.png', 3, 5, '오늘 마감'),
  pod('pod-003', '노란 멜론 3입 소분', 'honeydew-melon.png', 1, 4, 'D-1'),
  pod('pod-004', '늙은 호박 4입 소분', 'pumpkin.png', 4, 6, 'D-1'),
  pod('pod-005', '제주 귤 10kg 소분', 'orange.png', 5, 8, 'D-2'),
  pod('pod-006', '거봉 포도 2kg 소분', 'grapes.png', 2, 5, 'D-2'),
  pod('pod-007', '딸기 팩 3입 소분', 'strawberry.png', 6, 6, '마감 임박'),
  pod('pod-008', '양파 10kg 소분', 'onion.png', 3, 6, 'D-3'),
  pod('pod-009', '양배추 5통 소분', 'cabbage.png', 4, 6, 'D-4'),
  pod('pod-010', '통수박 3통 소분', 'watermelon.png', 1, 5, 'D-5'),
];

export const podsData: Record<`GET ${string}`, string> = {
  'GET pods?status=open&sort=best': JSON.stringify({
    data: {
      list: pods,
      total: 10,
      limit: 10,
      offset: 0,
    },
  }),
};
