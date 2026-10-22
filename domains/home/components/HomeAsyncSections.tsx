import { PopularProductsCarousel } from './PopularProductsCarousel';
import { ShareProductsCarousel } from './ShareProductsCarousel';
import { ProductCarousel } from '@/domains/home/components/ProductCarousel';
import {
  getHomeProducts,
  getRandomRecommendations,
  getAiRecommendations,
  getRecommendationStatus,
} from '@/domains/home/home.api';
import { resolveHomeRecommendationMode } from '@/domains/home/data/homeRecommendations';
import type { HomeProduct } from '@/domains/home/data/homeProducts';
import { getProductCatalog } from '@/domains/products/products.api';

/** 추천 상품 섹션: 상태 조회 → 모드 판정 → 모드별 추천 조회 후 캐러셀을 그립니다. */
export async function ShareProductsSection() {
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

/** 인기 상품 섹션: 인기 상품을 조회해 캐러셀을 그립니다. */
export async function PopularProductsSection() {
  const { popularProducts } = await getHomeProducts();
  return <PopularProductsCarousel products={popularProducts} />;
}

/** 상품 목록 섹션: 전체 상품 카탈로그를 조회해 캐러셀을 그립니다. */
export async function ProductCatalogSection() {
  const productCatalog = await getProductCatalog();
  return <ProductCarousel products={productCatalog} />;
}
