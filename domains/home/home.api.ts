import { apiClient } from '@/shared/lib/client';
import type { HomeProduct } from './data/homeProducts';
import type { HomeRecommendationStatus } from './data/homeRecommendations';

const ENDPOINTS = {
  randomRecommendations: 'home/recommendations/random',
  aiRecommendations: 'home/recommendations/ai',
  recommendationStatus: 'home/recommendations/status',
} as const;

/** 목업 제거 후 API 형태만 유지합니다. TODO: 실제 추천·인기 상품 조회를 연결합니다. */
export async function getHomeProducts(): Promise<{
  shareProducts: HomeProduct[];
  popularProducts: HomeProduct[];
}> {
  return { shareProducts: [], popularProducts: [] };
}

/** 랜덤 추천 상품을 조회합니다. */
export async function getRandomRecommendations(): Promise<HomeProduct[]> {
  return apiClient.get<HomeProduct[]>(ENDPOINTS.randomRecommendations);
}

/** 로그인 사용자의 AI 추천 상품을 조회합니다. */
export async function getAiRecommendations(): Promise<HomeProduct[]> {
  return apiClient.get<HomeProduct[]>(ENDPOINTS.aiRecommendations);
}

/** 홈 추천 모드 판정에 필요한 로그인·취향 상태를 조회합니다. */
export async function getRecommendationStatus(): Promise<HomeRecommendationStatus> {
  return apiClient.get<HomeRecommendationStatus>(
    ENDPOINTS.recommendationStatus,
  );
}
