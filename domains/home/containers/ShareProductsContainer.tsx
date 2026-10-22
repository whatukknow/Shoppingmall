// 'use client' 없음: 서버에서 추천 상품(공유 상품) 추천 모드별 목록을 조회하는 경계

import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import {
  getAiRecommendations,
  getRandomRecommendations,
  getRecommendationStatus,
} from '@/domains/home/home.api';
import { resolveHomeRecommendationMode } from '@/domains/home/data/homeRecommendations';
import type { HomeProduct } from '@/domains/home/data/homeProducts';

/** 추천 상품 섹션: 상태 조회 → 모드 판정 → 모드별 추천 조회 후 캐러셀을 그립니다. */
export default async function ShareProductsContainer() {
  const status = await getRecommendationStatus();
  const recommendationMode = resolveHomeRecommendationMode(status);
  let products: HomeProduct[];
  switch (recommendationMode) {
    case 'ai':
      products = await getAiRecommendations();
      break;
    case 'random':
      products = await getRandomRecommendations();
      break;
    default:
      products = [];
      break;
  }

  return (
    <ShareProductsCarousel products={products} mode={recommendationMode} />
  );
}
