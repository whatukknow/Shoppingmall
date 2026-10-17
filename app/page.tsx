import { BrandStorySection } from '@/domains/home/components/BrandStorySection';
import { HomeHero } from '@/domains/home/components/HomeHero';
import { HowItWorksSection } from '@/domains/home/components/HowItWorksSection';
import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import { TasteFinderSection } from '@/domains/home/components/TasteFinderSection';

/** Next.js 홈 경로에서 새 시안의 섹션을 순서대로 조합합니다. */
export default function HomePage() {
  return (
    <main className="min-h-screen text-[#242821]">
      <HomeHero />
      <HowItWorksSection />
      <ShareProductsCarousel />
      <PopularProductsCarousel />
      <BrandStorySection />
      <TasteFinderSection />
    </main>
  );
}
