'use client';

import type { Key, ReactNode } from 'react';
import { useEffect, useState } from 'react';

/** 캐러셀 데이터, 화면별 표시 개수, 키와 렌더 함수를 지정합니다. */
type CarouselContainerProps<Item> = {
  items: Item[];
  itemsPerSlide: number;
  getItemKey: (item: Item) => Key;
  renderItem: (item: Item, index: number) => ReactNode;
  ariaLabel?: string;
  responsive?: boolean;
};

/** 지정한 개수만큼 상품을 나눠 보여주고 이전·다음 슬라이드 이동을 제공합니다. */
export function CarouselContainer<Item>({
  items,
  itemsPerSlide,
  getItemKey,
  renderItem,
  ariaLabel = '상품 목록',
  responsive = false,
}: CarouselContainerProps<Item>) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [viewportPageSize, setViewportPageSize] = useState(5);

  useEffect(() => {
    if (!responsive) return;
    const updatePageSize = () => {
      setViewportPageSize(
        window.innerWidth >= 1024 ? 5 : window.innerWidth >= 640 ? 3 : 2,
      );
    };
    updatePageSize();
    window.addEventListener('resize', updatePageSize);
    return () => window.removeEventListener('resize', updatePageSize);
  }, [responsive]);

  const pageSize = Math.max(
    1,
    Math.min(5, Math.floor(itemsPerSlide), responsive ? viewportPageSize : 5),
  );
  const totalSlides = Math.ceil(items.length / pageSize);
  const lastSlide = Math.max(totalSlides - 1, 0);
  const visibleSlide = Math.min(currentSlide, lastSlide);
  const startIndex = visibleSlide * pageSize;
  const visibleItems = items.slice(startIndex, startIndex + pageSize);
  const firstItemNumber = items.length === 0 ? 0 : startIndex + 1;
  const lastItemNumber = startIndex + visibleItems.length;

  if (items.length === 0) return null;

  return (
    <section aria-label={ariaLabel} className="w-full">
      <div className="relative">
        <div
          className="grid gap-[12px] lg:gap-[19px]"
          style={{ gridTemplateColumns: `repeat(${pageSize}, minmax(0, 1fr))` }}
        >
          {visibleItems.map((item, index) => (
            <div key={getItemKey(item)}>
              {renderItem(item, startIndex + index)}
            </div>
          ))}
        </div>

        {totalSlides > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 상품 보기"
              disabled={visibleSlide === 0}
              onClick={() => setCurrentSlide((slide) => Math.max(slide - 1, 0))}
              className="absolute top-1/2 -left-10 -translate-y-1/2 text-3xl disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 상품 보기"
              disabled={visibleSlide === lastSlide}
              onClick={() =>
                setCurrentSlide((slide) => Math.min(slide + 1, lastSlide))
              }
              className="absolute top-1/2 -right-10 -translate-y-1/2 text-3xl disabled:opacity-30"
            >
              ›
            </button>
          </>
        )}
      </div>

      <p aria-live="polite" className="mt-6 text-center font-bold">
        {firstItemNumber}–{lastItemNumber} / {items.length}
      </p>
    </section>
  );
}
