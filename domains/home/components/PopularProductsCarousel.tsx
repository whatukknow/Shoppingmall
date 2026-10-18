'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import type { HomeProduct } from '../data/homeProducts';
import { HomeProductCard } from './HomeProductCard';

export function PopularProductsCarousel({
  products,
}: {
  products: HomeProduct[];
}) {
  return (
    <section className="mx-auto w-full max-w-[1260px] px-6 pt-14 md:px-0">
      <p className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#650f20]">
        MOST LOVED PORTIONS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        지금 가장 인기 있는 소분마켓 상품
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        인기 순위와 품목은 화면 확인을 위한 시안 예시예요.
      </p>

      <div className="mt-8 px-10">
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => product.name}
          ariaLabel="인기 소분마켓 상품 상위 10개, 시안 예시"
          renderItem={(product, index) => (
            <HomeProductCard product={product} rank={index + 1} />
          )}
        />
      </div>
    </section>
  );
}
