'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import type { HomeCardItem } from '../home.types';
import { HomeProductCard } from './HomeProductCard';

/** 전달받은 인기 소분팟을 표시합니다. */
export function PopularProductsCarousel({
  products,
}: {
  products: HomeCardItem[];
}) {
  return (
    <section className="max-w-1260px mx-auto w-full px-6 pt-14 md:px-0">
      <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
        MOST LOVED PORTIONS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        지금 가장 인기 있는 소분팟
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        함께 나누는 소분팟을 둘러보세요.
      </p>

      <div className="mt-8 min-h-48 px-10">
        {products.length === 0 && (
          <p className="text-muted-foreground py-12">등록된 소분팟이 없어요.</p>
        )}
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => product.id}
          ariaLabel="인기 소분팟"
          renderItem={(product, index) => (
            <HomeProductCard product={product} rank={index + 1} />
          )}
        />
      </div>
    </section>
  );
}
