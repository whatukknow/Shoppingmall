import { Suspense } from 'react';
import { BrandStorySection } from '@/domains/home/components/BrandStorySection';
import { HomeHero } from '@/domains/home/components/HomeHero';
import { HowItWorksSection } from '@/domains/home/components/HowItWorksSection';
import { TasteFinderSection } from '@/domains/home/components/TasteFinderSection';
import ShareProductsContainer from '@/domains/home/containers/ShareProductsContainer';
import PopularProductsContainer from '@/domains/home/containers/PopularProductsContainer';
import ProductCatalogContainer from '@/domains/home/containers/ProductCatalogContainer';
import { ProductCarouselSkeleton } from '@/shared/components/ProductCarouselSkeleton';

/** Next.js 홈 경로에서 새 시안의 섹션을 순서대로 조합합니다. */
export default function HomePage() {
  return (
    <main className="lp-home min-h-screen text-[#242821]">
      <HomeHero />
      <HowItWorksSection />
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <ShareProductsContainer />
      </Suspense>
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <PopularProductsContainer />
      </Suspense>
      <Suspense fallback={<ProductCarouselSkeleton />}>
        <ProductCatalogContainer />
      </Suspense>
      <BrandStorySection />
      <TasteFinderSection />
    </main>
  );
}
