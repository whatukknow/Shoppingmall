'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import type { HomeProduct } from '../data/homeProducts';
import { HomeProductCard } from './HomeProductCard';

/** 인기 상품 시안 10개를 5개씩 두 장으로 보여줍니다. */
export function PopularProductsCarousel({
  products,
}: {
  products: HomeProduct[];
}) {
  return (
    <section className="max-w-1260px mx-auto w-full px-6 pt-14 md:px-0">
      <p className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#650f20]">
        MOST LOVED PORTIONS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        지금 가장 인기 있는 소분팟
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        인기 소분팟 데이터 연동 전까지는 시안 상품으로 보여줘요.
      </p>

      <div className="mt-8 px-10">
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => product.name}
          ariaLabel="인기 소분팟 시안 상품"
          renderItem={(product, index) => (
            <HomeProductCard product={product} rank={index + 1} />
          )}
        />
      </div>
    </section>
  );
}
