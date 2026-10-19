'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import type { HomeProduct } from '../data/homeProducts';
import { HomeProductCard } from './HomeProductCard';

/** 함께 나눌 품목 22개를 5개씩 나눠 캐러셀로 보여줍니다. */
export function ShareProductsCarousel({ products }: { products: HomeProduct[] }) {
  return (
    <section className="mx-auto w-full max-w-[1260px] px-6 pt-14 md:px-0">
      <p className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#650f20]">
        A FEW THINGS TO SHARE
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        함께 나눌 품목을 골라보세요
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        계절에 맞는 식재료를 필요한 만큼 함께 나눠요.
      </p>

      <div className="mt-8 px-10">
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => product.name}
          ariaLabel="함께 나눌 품목"
          renderItem={(product) => <HomeProductCard product={product} />}
        />
      </div>

      <hr className="mt-10 border-[#e0ded6]" />
    </section>
  );
}
