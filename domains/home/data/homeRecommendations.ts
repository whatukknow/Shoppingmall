import type { HomeProduct } from './homeProducts';

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
