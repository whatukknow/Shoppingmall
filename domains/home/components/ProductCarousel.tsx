'use client';

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import Image from 'next/image';
import Link from 'next/link';
import type { ReactNode } from 'react';
import type { CatalogProduct } from '@/domains/products/data/productCatalog';

/** 상품목록 데이터를 기존 홈 캐러셀과 같은 상품 카드 모양으로 보여줍니다. */
export function ProductCarousel({ products }: { products: CatalogProduct[] }) {
  return (
    <section className="max-w-1260px mx-auto w-full px-6 pt-14 md:px-0">
      <p className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#650f20]">
        EXPLORE PRODUCTS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        상품 둘러보기
      </h2>
      <p className="mt-2 text-[13px] text-[#77766f]">
        다양한 상품을 둘러보세요.
      </p>

      <div className="mt-8 px-10">
        <CarouselContainer
          items={products}
          itemsPerSlide={5}
          getItemKey={(product) => String(product.id ?? `${product.name}-${product.category}`)}
          ariaLabel="상품 목록"
          renderItem={(product) => (
            <ProductCardLink id={product.id}>
              <div className="flex h-[150px] items-center justify-center sm:h-[190px]">
                {product.image ? (
                  <Image
                    src={product.image}
                    alt=""
                    width={170}
                    height={170}
                    className="size-[138px] object-contain sm:size-[170px]"
                  />
                ) : null}
              </div>
              <div className="pt-3">
                <h3 className="text-base leading-7 font-bold sm:text-[19px]">
                  {product.name}
                </h3>
              </div>
            </ProductCardLink>
          )}
        />
      </div>
    </section>
  );
}

function ProductCardLink({
  id,
  children,
}: {
  id?: string | number;
  children: ReactNode;
}) {
  return id !== undefined ? (
    <Link href={`/products/${encodeURIComponent(String(id))}`} className="block min-w-0 transition-opacity hover:opacity-75">
      {children}
    </Link>
  ) : (
    <div className="block min-w-0">{children}</div>
  );
}
