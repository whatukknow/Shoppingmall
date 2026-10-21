import { BrandStorySection } from '@/domains/home/components/BrandStorySection';
import { HomeHero } from '@/domains/home/components/HomeHero';
import { HowItWorksSection } from '@/domains/home/components/HowItWorksSection';
import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import { ProductCarousel } from '@/domains/home/components/ProductCarousel';
import { TasteFinderSection } from '@/domains/home/components/TasteFinderSection';
import {
  getHomeProducts,
  getRandomRecommendations,
  getAiRecommendations,
  getRecommendationStatus,
} from '@/domains/home/home.api';
import { resolveHomeRecommendationMode } from '@/domains/home/data/homeRecommendations';
import type { HomeProduct } from '@/domains/home/data/homeProducts';
import { getProductCatalog } from '@/domains/products/products.api';

/** Next.js 홈 경로에서 새 시안의 섹션을 순서대로 조합합니다. */
export default async function HomePage() {
  const { popularProducts } = await getHomeProducts();
  const productCatalog = await getProductCatalog();
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
    <main className="lp-home min-h-screen text-[#242821]">
      <HomeHero />
      <HowItWorksSection />
      <ShareProductsCarousel products={products} mode={recommendationMode} />
      <PopularProductsCarousel products={popularProducts} />
      <ProductCarousel products={productCatalog} />
      <BrandStorySection />
      <TasteFinderSection />
    </main>
  );
}
