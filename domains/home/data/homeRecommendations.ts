import {
  catalogImages,
  findCatalogProduct,
} from '@/domains/products/catalog/catalog';
import type { HomeCardItem } from '../home.types';

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
  return status.hasTasteProfile ? 'ai' : 'random';
}

export const HOME_RECOMMENDATIONS_KEY = 'little-portions:home-recommendations';

/** 실제로 표시할 수 있는 카탈로그 상품으로 투영한 뒤 추천/랜덤을 결정한다. */
export async function loadHomeRecommendations(
  status: HomeRecommendationStatus,
  loaders: {
    ai: () => Promise<HomeCardItem[]>;
    random: () => Promise<HomeCardItem[]>;
  },
): Promise<{ mode: HomeRecommendationMode; products: HomeCardItem[] }> {
  const project = (products: HomeCardItem[]) =>
    products.flatMap((p) => {
      const item = findCatalogProduct(p.id) ?? findCatalogProduct(p.name);
      return item
        ? [
            {
              ...p,
              id: item.id,
              name: item.name,
              imageUrl: catalogImages(item.id)!.recommendation,
            },
          ]
        : [];
    });
  if (resolveHomeRecommendationMode(status) === 'ai') {
    // 장애는 전파한다. 성공했지만 표시 가능한 추천이 없을 때만 랜덤으로 대체한다.
    const products = project(await loaders.ai());
    if (products.length) return { mode: 'ai', products };
  }
  return { mode: 'random', products: project(await loaders.random()) };
}
