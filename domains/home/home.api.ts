import { raw } from '@/domains/products/catalog/catalog';
import { apiClient, ApiError } from '@/shared/lib/client';
import type { ApiResponse, ListResponse } from '@/shared/lib/api.types';
import type { RecommendedProduct } from './home.types';
import { HOME_LIST_LIMIT } from './home.constants';
import type { HomeRecommendationStatus } from './data/homeRecommendations';
import type { HomeProduct } from './data/homeProducts';
import { getMe } from '@/domains/auth/users.api';

const ENDPOINTS = {
  randomRecommendations: 'products',
  aiRecommendations: 'users/me/product-recommendations',
} as const;

/** 랜덤 추천 상품을 조회합니다. */
export async function getRandomRecommendations(
  limit: number = HOME_LIST_LIMIT.recommendations,
): Promise<RecommendedProduct[]> {
  const response = await apiClient.get<
    ApiResponse<ListResponse<RecommendedProduct>>
  >(ENDPOINTS.randomRecommendations, { params: { type: 'random', limit } });
  return response.data.list;
}

/** 로그인 사용자의 AI 추천 상품을 조회합니다. */
export async function getAiRecommendations(
  limit: number = HOME_LIST_LIMIT.recommendations,
): Promise<RecommendedProduct[]> {
  const response = await apiClient.get<
    ApiResponse<ListResponse<RecommendedProduct>>
  >(ENDPOINTS.aiRecommendations, { params: { limit } });
  return response.data.list;
}

// TODO(session): 세션(쿠키)의 사용자 기준으로 조회 — users/me 의 hasTasteProfile 로 판정
/** 홈 추천 모드 판정에 필요한 로그인·취향 상태를 조회합니다. */
export async function getRecommendationStatus(): Promise<HomeRecommendationStatus> {
  const user = await getMe().catch((error: unknown) => {
    if (error instanceof ApiError && error.status === 401) return null;
    throw error;
  });

  if (!user) {
    return { isLoggedIn: false, hasTasteProfile: false };
  }

  return { isLoggedIn: true, hasTasteProfile: user.hasTasteProfile };
}

// 온보딩 레이아웃(app/onboarding/layout.tsx)이 아직 사용하므로 유지합니다.
// TODO: 온보딩이 새 API 로 전환되면 삭제합니다.
export async function getHomeProducts(): Promise<{
  shareProducts: HomeProduct[];
  popularProducts: HomeProduct[];
}> {
  return {
    shareProducts: raw.map((p) => ({
      id: p.id,
      name: p.name,
      description: '',
      illustration: p.id,
    })),
    popularProducts: [],
  };
}
