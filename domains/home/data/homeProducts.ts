/** 홈의 함께 나눌 품목 캐러셀에 쓰는 시안 데이터입니다. */
export const shareProducts = [
  {
    name: '참외',
    description: '아삭하고 달콤한 제철 과일',
    illustration: 'koreanMelon',
  },
  {
    name: '완숙 토마토',
    description: '붉게 익은 토마토를 함께 나눠요',
    illustration: 'tomatoes',
  },
  {
    name: '머스크멜론',
    description: '향긋하고 부드러운 과육',
    illustration: 'melon',
  },
  {
    name: '단호박',
    description: '포슬포슬 달큰한 제철 채소',
    illustration: 'pumpkin',
  },
  {
    name: '홍감자',
    description: '필요한 만큼 함께 나눠요',
    illustration: 'orange',
  },
  {
    name: '적포도',
    description: '산뜻하고 아삭한 한 송이',
    illustration: 'grapes',
  },
  {
    name: '설향 딸기',
    description: '제철의 달콤함을 나눠요',
    illustration: 'strawberry',
  },
  {
    name: '양파',
    description: '향긋하고 알싸한 기본 채소',
    illustration: 'onion',
  },
  {
    name: '양배추',
    description: '아삭하고 담백하게 즐겨요',
    illustration: 'cabbage',
  },
  {
    name: '대파',
    description: '요리에 자주 쓰는 향긋한 채소',
    illustration: 'scallion',
  },
  {
    name: '완두콩',
    description: '톡톡 씹히는 초록 콩',
    illustration: 'peas',
  },
  {
    name: '방울양배추',
    description: '작고 귀여운 한입 채소',
    illustration: 'brusselsSprouts',
  },
  {
    name: '사과',
    description: '아삭한 식감과 달콤한 과즙',
    illustration: 'apple',
  },
  {
    name: '감귤',
    description: '손쉽게 까먹는 새콤달콤한 과일',
    illustration: 'mandarin',
  },
  {
    name: '수박',
    description: '시원하고 달콤한 여름 과일',
    illustration: 'watermelon',
  },
  {
    name: '스테이크용 고기',
    description: '푸짐한 한 끼를 함께 나눠요',
    illustration: 'beefSteak',
  },
  {
    name: '계란',
    description: '다양한 요리에 곁들이는 식재료',
    illustration: 'friedEgg',
  },
  {
    name: '돼지고기',
    description: '구이와 요리에 활용하기 좋아요',
    illustration: 'porkSteak',
  },
  {
    name: '닭다리',
    description: '함께 즐기는 든든한 한 조각',
    illustration: 'chickenDrumstick',
  },
  {
    name: '블루베리',
    description: '작은 알갱이에 담긴 달콤함',
    illustration: 'blueberries',
  },
  {
    name: '용과',
    description: '산뜻한 색감과 부드러운 과육',
    illustration: 'dragonFruitIllustration',
  },
  {
    name: '복숭아',
    description: '향긋하고 달콤한 과즙을 나눠요',
    illustration: 'peachIllustration',
  },
] as const;

/** 인기 집계가 연동되기 전까지 화면에만 쓰는 순위 예시입니다. */
export const popularProducts = [
  {
    name: '적포도',
    description: '한 알씩 나눠 먹기 좋은 과일',
    illustration: 'grapes',
  },
  {
    name: '설향 딸기',
    description: '달콤한 제철 과일',
    illustration: 'strawberry',
  },
  {
    name: '완숙 토마토',
    description: '샐러드와 요리에 두루 쓰는 채소',
    illustration: 'tomatoes',
  },
  {
    name: '참외',
    description: '달큰하고 아삭한 제철 과일',
    illustration: 'koreanMelon',
  },
  {
    name: '단호박',
    description: '식탁에 달큰함을 더해요',
    illustration: 'pumpkin',
  },
  {
    name: '머스크멜론',
    description: '넉넉히 나눠 즐기는 과일',
    illustration: 'melon',
  },
  {
    name: '국산 양파',
    description: '매일 요리에 빠지지 않는 재료',
    illustration: 'onion',
  },
  {
    name: '완두콩',
    description: '필요한 만큼 간편하게',
    illustration: 'peas',
  },
  {
    name: '감귤',
    description: '한입에 즐기는 산뜻한 과일',
    illustration: 'mandarin',
  },
  {
    name: '사과',
    description: '함께 나누기 좋은 아삭한 과일',
    illustration: 'apple',
  },
] as const;

export type HomeProduct =
  ((typeof shareProducts)[number] | (typeof popularProducts)[number]) & {
    /** API가 실제 상품 ID를 제공할 때만 상품 경로를 연결합니다. */
    id?: string | number;
  };
