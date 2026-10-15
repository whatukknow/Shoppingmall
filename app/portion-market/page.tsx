import Link from 'next/link';
import { getPortionMarketDetail } from '@/domains/portion-market/portionMarket.api';
import { toPortionMarketPage } from '@/domains/portion-market/portionMarket.mapper';
import { PortionMarketHero } from '@/domains/portion-market/components/PortionMarketHero';
import { PortionMarketKitSteps } from '@/domains/portion-market/components/PortionMarketKitSteps';
import PortionMarketCarouselContainer from './PortionMarketCarouselContainer';

// 'use client'가 없으므로 서버 컴포넌트
// 데이터를 받아서 부품을 순서대로 놓기만 함
export default async function PortionMarketPage() {
  const response = await getPortionMarketDetail(); // ① 데이터 불러오기
  const { heroImageUrl, kitName, steps, sections } =
    toPortionMarketPage(response); // ② 화면용으로 바꾸기

  return (
    <main className="bg-background text-foreground mx-auto w-full max-w-[1080px] px-4 py-10 font-sans">
      {/* 맨 위: 누르면 메인으로 */}
      <Link href="/" className="font-heading text-[14px]">
        ← Little portion
      </Link>

      {/* 상단: 소개 글 + 매장 사진 */}
      <PortionMarketHero imageUrl={heroImageUrl} />

      {/* 01~03: 키트 조리 순서 */}
      <PortionMarketKitSteps kitName={kitName} steps={steps} />

      {/* 중단·하단: 데이터에 있는 칸 수만큼 캐러셀이 그려짐 */}
      {sections.map((section) => (
        <section key={section.categoryId} className="mt-16">
          <h2 className="text-[24px] font-bold">{section.title}</h2>
          <p className="mt-2 text-[14px]">{section.description}</p>
          <div className="mt-6">
            <PortionMarketCarouselContainer products={section.products} />
          </div>
        </section>
      ))}

      {/* 이용 방법 */}
      <section className="border-foreground/20 mt-16 border px-8 py-8">
        <h2 className="text-[20px] font-bold">이렇게 함께해요</h2>
        <p className="mt-3 text-[15px] font-bold">
          ① 원하는 재료 찾기 → ② 필요한 양 살펴보기 → ③ 나눔 방식 확인하기
        </p>
      </section>

      {/* 마무리 문구 */}
      <section className="mt-16 text-right">
        <p className="font-heading text-primary text-[32px] uppercase">
          Good food. Small table.
        </p>
        <p className="mt-1 text-[13px]">한두 사람의 식탁에, 취향은 가득.</p>
      </section>

      {/* 메인으로 돌아가기 */}
      <Link href="/" className="mt-10 inline-block text-[13px] font-bold">
        메인으로 돌아가기 ↗
      </Link>
    </main>
  );
}
