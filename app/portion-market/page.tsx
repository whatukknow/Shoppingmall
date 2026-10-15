import Link from 'next/link';
import { getPortionMarketDetail } from '@/domains/portion-market/portionMarket.api';
import { toPortionMarketPage } from '@/domains/portion-market/portionMarket.mapper';
import { PortionMarketHero } from '@/domains/portion-market/components/PortionMarketHero';
import { PortionMarketKitSteps } from '@/domains/portion-market/components/PortionMarketKitSteps';
import PortionMarketCarouselContainer from '@/domains/portion-market/components/PortionMarketCarouselContainer';

export default async function PortionMarketPage() {
  const response = await getPortionMarketDetail();
  const { heroImageUrl, kitName, steps, sections } =
    toPortionMarketPage(response);

  return (
    <main className="bg-background text-foreground mx-auto w-full max-w-[1080px] px-4 py-10 font-sans">
      <Link href="/" className="font-heading text-[14px]">
        ← Little portion
      </Link>

      <PortionMarketHero imageUrl={heroImageUrl} />

      <PortionMarketKitSteps kitName={kitName} steps={steps} />

      {sections.map((section) => (
        <section key={section.categoryId} className="mt-16">
          <h2 className="text-[24px] font-bold">{section.title}</h2>
          <p className="mt-2 text-[14px]">{section.description}</p>
          <div className="mt-6">
            <PortionMarketCarouselContainer products={section.products} />
          </div>
        </section>
      ))}

      <section className="border-foreground/20 mt-16 border px-8 py-8">
        <h2 className="text-[20px] font-bold">이렇게 함께해요</h2>
        <p className="mt-3 text-[15px] font-bold">
          ① 원하는 재료 찾기 → ② 필요한 양 살펴보기 → ③ 나눔 방식 확인하기
        </p>
      </section>

      <section className="mt-16 text-right">
        <p className="font-heading text-primary text-[32px] uppercase">
          Good food. Small table.
        </p>
        <p className="mt-1 text-[13px]">한두 사람의 식탁에, 취향은 가득.</p>
      </section>

      <Link href="/" className="mt-10 inline-block text-[13px] font-bold">
        메인으로 돌아가기 ↗
      </Link>
    </main>
  );
}
