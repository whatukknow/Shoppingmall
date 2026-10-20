import type { HomeProduct } from './data/homeProducts';

/** 목업 제거 후 API 형태만 유지합니다. TODO: 실제 추천·인기 상품 조회를 연결합니다. */
export async function getHomeProducts(): Promise<{
  shareProducts: HomeProduct[];
  popularProducts: HomeProduct[];
}> {
  return { shareProducts: [], popularProducts: [] };
}
