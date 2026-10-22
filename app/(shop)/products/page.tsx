/*전체 상품 리스트 */

import { Suspense } from 'react';

import Link from 'next/link';
import ProductCountContainer from '@/domains/products/containers/ProductCountContainer';
import ProductListContainer from '@/domains/products/containers/ProductListContainer';
import { ProductGridSkeleton } from '@/domains/products/components/ProductGridSkeleton';

export default function ProductListPage() {
  return (
    <main className="bg-background flex-1 pb-24 font-sans">
      <header className="mx-auto w-full max-w-[1440px] px-6 pt-14">
        <div className="border-foreground/15 flex items-end justify-between border-b pb-8">
          <div></div>

          <Link
            href="/"
            className="text-foreground inline-block text-[14px] underline underline-offset-4"
          >
            ← 오늘의 식탁으로
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="product-list-title"
        className="mx-auto mt-16 w-full max-w-[1440px] px-6"
      >
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
              02 / YOUR PANTRY
            </p>

            <h1
              id="product-list-title"
              className="text-primary mt-4 text-[48px] leading-[1.2] font-bold"
            >
              전체 상품
            </h1>

            <p className="text-foreground mt-4 text-[20px] leading-[1.5]">
              작은 식탁에 필요한 만큼, 천천히 골라보세요.
            </p>
          </div>

          <Suspense
            fallback={
              <div
                className="mb-1 h-5 w-16 animate-pulse rounded bg-[#e0ded6]"
                aria-busy="true"
                aria-label="상품 개수를 불러오는 중이에요."
              />
            }
          >
            <ProductCountContainer />
          </Suspense>
        </div>
      </section>
      <section
        aria-labelledby="product-list-title"
        aria-label="전체 상품 목록"
        className="mx-auto mt-12 w-full max-w-[1440px] px-6"
      >
        <Suspense fallback={<ProductGridSkeleton />}>
          <ProductListContainer />
        </Suspense>
      </section>
    </main>
  );
}
