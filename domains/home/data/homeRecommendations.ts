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
