import type { HomeProduct } from './homeProducts';

export type HomeRecommendationMode = 'random' | 'ai' | 'needs-taste';

export type HomeRecommendationStatus = {
  isLoggedIn: boolean;
  hasTasteProfile: boolean;
};

/** 로그인·취향 데이터 유무로 홈 추천 모드를 결정합니다. */
export function resolveHomeRecommendationMode(
  status: HomeRecommendationStatus,
): HomeRecommendationMode {
  if (!status.isLoggedIn) return 'random';
  return status.hasTasteProfile ? 'ai' : 'needs-taste';
}

export const HOME_RECOMMENDATIONS_KEY = 'little-portions:home-recommendations';

/** 저장된 추천 상품 키를 홈 상품 데이터와 원래 순서대로 연결합니다. */
export function resolveHomeRecommendations(
  savedValue: string | null,
  products: readonly HomeProduct[],
): HomeProduct[] {
  if (!savedValue) return [];

  try {
    const illustrationKeys = JSON.parse(savedValue) as string[];
    return [...new Set(illustrationKeys)]
      .map((key) => products.find((product) => product.illustration === key))
      .filter((product): product is HomeProduct => product !== undefined)
      .slice(0, 5);
  } catch {
    return [];
  }
}
