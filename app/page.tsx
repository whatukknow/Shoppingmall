import { BrandStorySection } from '@/domains/home/components/BrandStorySection';
import { HomeMasthead } from '@/domains/home/components/HomeMasthead';
import { HomeHero } from '@/domains/home/components/HomeHero';
import { HowItWorksSection } from '@/domains/home/components/HowItWorksSection';
import { PantryCarousel } from '@/domains/home/components/PantryCarousel';
import { ShareProductsCarousel } from '@/domains/home/components/ShareProductsCarousel';
import { getHomeProducts } from '@/domains/home/home.api';
import Script from 'next/script';

export default async function HomePage() {
  const { shareProducts, pantryProducts } = await getHomeProducts();

  return (
    <main className="min-h-screen bg-[#f1ebd6] pb-16 text-[#48131b] md:pb-20">
      <Script src="https://mcp.figma.com/mcp/html-to-design/capture.js" strategy="afterInteractive" />
      <HomeMasthead />
      <HomeHero />
      <HowItWorksSection products={shareProducts} />
      <ShareProductsCarousel products={shareProducts} />
      <PantryCarousel products={pantryProducts} />
      <BrandStorySection />
    </main>
  );
}
