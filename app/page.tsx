import { BrandStorySection } from '@/domains/home/components/BrandStorySection';
import { HomeEntryGate } from '@/domains/home/components/HomeEntryGate';
import { HomeHero } from '@/domains/home/components/HomeHero';
import { HowItWorksSection } from '@/domains/home/components/HowItWorksSection';
import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import { ProductCarousel } from '@/domains/home/components/ProductCarousel';
import { TasteFinderSection } from '@/domains/home/components/TasteFinderSection';
import { getHomeProducts } from '@/domains/home/home.api';
import { productCatalog } from '@/domains/products/data/productCatalog';
import { connection } from 'next/server';

function chooseRandomProducts<T>(products: readonly T[], count: number): T[] {
  const shuffled = [...products];
  for (let index = shuffled.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled.slice(0, count);
}

/** Next.js 홈 경로에서 새 시안의 섹션을 순서대로 조합합니다. */
export default async function HomePage() {
  await connection();
  const { shareProducts, popularProducts } = await getHomeProducts();
  const guestProducts = chooseRandomProducts(shareProducts, 15);

  return (
    <HomeEntryGate>
      <main className="min-h-screen text-[#242821]">
        <HomeHero />
        <HowItWorksSection />
        <ShareProductsCarousel
          allProducts={shareProducts}
          guestProducts={guestProducts}
        />
        <PopularProductsCarousel products={popularProducts} />
        <ProductCarousel products={productCatalog} />
        <BrandStorySection />
        <TasteFinderSection />
      </main>
    </HomeEntryGate>
  );
}
