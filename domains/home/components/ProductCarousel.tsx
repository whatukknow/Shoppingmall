'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import Image from 'next/image';
import Link from 'next/link';

/** 상품 둘러보기 목록 항목입니다. */
export type CatalogCardProduct = {
  id: string;
  name: string;
  imageUrl: string;
};

/** 상품목록 데이터를 기존 홈 캐러셀과 같은 상품 카드 모양으로 보여줍니다. */
export function ProductCarousel({
  products,
}: {
  products: CatalogCardProduct[];
}) {
  return (
    <section className="max-w-1260px mx-auto w-full px-6 pt-14 md:px-0">
      <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
        EXPLORE PRODUCTS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        상품 둘러보기
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        다양한 상품을 둘러보세요.
      </p>

      <div className="mt-8 min-h-48 px-10">
        {products.length === 0 && (
          <p className="text-muted-foreground py-12">등록된 상품이 없어요.</p>
        )}
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => product.id}
          ariaLabel="상품 목록"
          renderItem={(product) => (
            <Link
              href={`/products/${encodeURIComponent(product.id)}`}
              className="block min-w-0 transition-opacity hover:opacity-75"
            >
              <div className="flex h-[150px] items-center justify-center sm:h-[190px]">
                <Image
                  src={product.imageUrl}
                  alt=""
                  width={170}
                  height={170}
                  sizes="(max-width: 640px) 138px, 170px"
                  className="size-[138px] object-contain sm:size-[170px]"
                />
              </div>
              <div className="pt-3">
                <h3 className="text-base leading-7 font-bold sm:text-[19px]">
                  {product.name}
                </h3>
              </div>
            </Link>
          )}
        />
      </div>
    </section>
  );
}
