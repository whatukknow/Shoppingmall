'use client';

import type { Key, ReactNode } from 'react';
import { useState } from 'react';

type CarouselContainerProps<Item> = {
  items: Item[];
  itemsPerSlide: number;
  getItemKey: (item: Item) => Key;
  renderItem: (item: Item) => ReactNode;
  ariaLabel?: string;
};

export function CarouselContainer<Item>({
  items,
  itemsPerSlide,
  getItemKey,
  renderItem,
  ariaLabel = '상품 목록',
}: CarouselContainerProps<Item>) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const pageSize = Math.max(1, Math.floor(itemsPerSlide));
  const totalSlides = Math.ceil(items.length / pageSize);
  const lastSlide = Math.max(totalSlides - 1, 0);
  const visibleSlide = Math.min(currentSlide, lastSlide);
  const startIndex = visibleSlide * pageSize;
  const visibleItems = items.slice(startIndex, startIndex + pageSize);
  const firstItemNumber = items.length === 0 ? 0 : startIndex + 1;
  const lastItemNumber = startIndex + visibleItems.length;

  return (
    <section aria-label={ariaLabel} className="w-full">
      <div className="relative">
        <div
          className="grid gap-6"
          style={{ gridTemplateColumns: `repeat(${pageSize}, minmax(0, 1fr))` }}
        >
          {visibleItems.map((item) => (
            <div key={getItemKey(item)}>{renderItem(item)}</div>
          ))}
        </div>

        {totalSlides > 1 && (
          <>
            <button
              type="button"
              aria-label="이전 슬라이드"
              disabled={visibleSlide === 0}
              onClick={() => setCurrentSlide((slide) => Math.max(slide - 1, 0))}
              className="absolute top-1/2 -left-10 -translate-y-1/2 text-3xl disabled:opacity-30"
            >
              ‹
            </button>
            <button
              type="button"
              aria-label="다음 슬라이드"
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
