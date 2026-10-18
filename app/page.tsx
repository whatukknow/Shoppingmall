import { BrandStorySection } from '@/domains/home/components/BrandStorySection';
import { HomeHero } from '@/domains/home/components/HomeHero';
import { HowItWorksSection } from '@/domains/home/components/HowItWorksSection';
import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import { TasteFinderSection } from '@/domains/home/components/TasteFinderSection';
import { getHomeProducts } from '@/domains/home/home.api';

export default async function HomePage() {
  const { shareProducts, popularProducts } = await getHomeProducts();

  return (
    <main className="min-h-screen text-[#242821]">
      <HomeHero />
      <HowItWorksSection />
      <ShareProductsCarousel products={shareProducts} />
      <PopularProductsCarousel products={popularProducts} />
      <BrandStorySection />
      <TasteFinderSection />
    </main>
  );
}
