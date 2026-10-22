'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import { TasteFinderPromptCard } from './TasteFinderPromptCard';
import type { HomeRecommendationMode } from '../data/homeRecommendations';
import type { HomeCardItem } from '../home.types';
import { HomeProductCard } from './HomeProductCard';

/** 추천 모드에 맞는 상품 목록과 취향 유도 카드를 보여줍니다. */
export function ShareProductsCarousel({
  products,
  mode,
}: {
  products: HomeCardItem[];
  mode: HomeRecommendationMode;
}) {
  const visibleProducts = products;
  const showAiCopy = mode !== 'random';

  return (
    <section
      id="share-products"
      className="max-w-1260px mx-auto w-full scroll-mt-8 px-6 pt-14"
    >
      <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
        PICKS FOR YOU
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        {showAiCopy ? 'AI가 추천하는 당신의 장바구니' : '오늘의 랜덤 추천'}
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        {showAiCopy
          ? '한 끼 사주에서 선택한 답변에 맞춘 식재료예요.'
          : '오늘의 추천 상품을 둘러보세요.'}
      </p>

      <div className="mt-8 min-h-48 px-10">
        {mode === 'needs-taste' ? (
          <TasteFinderPromptCard />
        ) : (
          <>
            {visibleProducts.length === 0 && (
              <p className="text-muted-foreground py-12">추천 상품이 없어요.</p>
            )}
            <CarouselContainer
              // 화면 너비에 따라 PC 5개 · 태블릿 3개 · 모바일 2개로 표시합니다.
              responsive
              items={visibleProducts}
              itemsPerSlide={5}
              getItemKey={(product) => product.id}
              ariaLabel={
                showAiCopy
                  ? '한 끼 사주 취향 추천 상품'
                  : '오늘의 랜덤 추천 상품'
              }
              renderItem={(product) => <HomeProductCard product={product} />}
            />
          </>
        )}
      </div>

      <hr className="mt-10 border-[#e0ded6]" />
    </section>
  );
}
