'use client';

import { useEffect, useState } from 'react';
import type { PantryProduct } from '../data/homeProducts';
import { formatPrice } from '@/shared/utils/formatPrice';
import Image from 'next/image';

export function PantryCarousel({ products }: { products: PantryProduct[] }) {
  const [isDesktop, setIsDesktop] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const itemsPerPage = isDesktop ? 4 : 2;
  const pageCount = Math.max(1, Math.ceil(products.length / itemsPerPage));
  const visiblePage = Math.min(currentPage, pageCount - 1);
  const startIndex = visiblePage * itemsPerPage;
  const visibleProducts = products.slice(startIndex, startIndex + itemsPerPage);

  useEffect(() => {
    const media = window.matchMedia('(min-width: 768px)');
    const syncViewport = () => setIsDesktop(media.matches);
    syncViewport();
    media.addEventListener('change', syncViewport);

    return () => media.removeEventListener('change', syncViewport);
  }, []);

  return (
    <section className="mx-auto mt-14 w-full max-w-[1080px] px-5 md:mt-[64px] md:px-0">
      <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-[#650f20]">
        02 / YOUR PANTRY
      </p>
      <h2 className="mt-3 text-[28px] leading-[1.3] font-bold sm:text-[38px]">
        취향을 담는 장바구니
      </h2>
      <div className="relative mt-8 border-y border-[#d8d2c3] py-5 md:mt-7 md:border-0 md:py-0">
        <div className="grid grid-cols-2 gap-x-4 gap-y-6 md:grid-cols-4 md:gap-6">
          {visibleProducts.map((product) => (
            <article key={product.id} className="min-w-0">
              <div className="relative mb-4 aspect-[250/300] overflow-hidden bg-[#fffdf7]">
                <Image
                  src={product.image}
                  alt={product.name}
                  width={500}
                  height={600}
                  sizes="(max-width: 768px) 45vw, 250px"
                  className="h-full w-full object-cover"
                />
              </div>
              <h3 className="min-h-10 text-xs leading-5 font-medium md:min-h-0 md:text-[13px]">
                {product.name}
              </h3>
              <p className="mt-2 text-sm font-semibold">{formatPrice(product.price)}</p>
            </article>
          ))}
        </div>

        <button
          type="button"
          aria-label="이전 상품"
          disabled={visiblePage === 0}
          onClick={() => setCurrentPage((page) => Math.max(0, page - 1))}
          className="absolute -left-4 top-1/2 -translate-y-1/2 text-2xl text-[#48131b] disabled:opacity-30 md:-left-10 md:text-3xl"
        >
          ‹
        </button>
        <button
          type="button"
          aria-label="다음 상품"
          disabled={visiblePage >= pageCount - 1}
          onClick={() => setCurrentPage((page) => Math.min(pageCount - 1, page + 1))}
          className="absolute -right-4 top-1/2 -translate-y-1/2 text-2xl text-[#48131b] disabled:opacity-30 md:-right-10 md:text-3xl"
        >
          ›
        </button>
      </div>

      <p aria-live="polite" className="mt-4 text-center text-[11px] font-medium text-[#77766f]">
        {products.length === 0 ? '0 / 0' : `${startIndex + 1}–${startIndex + visibleProducts.length} / ${products.length}`}
      </p>
    </section>
  );
}
