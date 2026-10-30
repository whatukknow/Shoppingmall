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
        Popular buying groups
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        Find a group and share a larger pack.
      </p>

      <div className="mt-8 min-h-48 px-10">
        {products.length === 0 && (
          <p className="text-muted-foreground py-12">No buying groups yet.</p>
        )}
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => product.id}
          ariaLabel="Popular buying groups"
          renderItem={(product, index) => (
            <HomeProductCard
              product={product}
              href={`/pods/product/${encodeURIComponent(product.id)}`}
              rank={index + 1}
            />
          )}
        />
      </div>
    </section>
  );
}
