'use client';

import type { Key, ReactNode } from 'react';
import { useState } from 'react';

type CarouselContainerProps<T> = {
  items: T[];
  itemsPerSlide: number;
  getItemKey: (item: T) => Key;
  renderItem: (item: T) => ReactNode;
};

export function CarouselContainer<T>({
  items,
  itemsPerSlide,
  getItemKey,
  renderItem,
}: CarouselContainerProps<T>) {
  const visibleItemCount =
    Number.isFinite(itemsPerSlide) && itemsPerSlide > 0
      ? Math.max(1, Math.floor(itemsPerSlide))
      : 1;
  const lastSlide = Math.max(0, Math.ceil(items.length / visibleItemCount) - 1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const activeSlide = Math.min(currentSlide, lastSlide);
  const visibleItems = items.slice(
    activeSlide * visibleItemCount,
    (activeSlide + 1) * visibleItemCount,
  );

  return (
    <section aria-label="상품 캐러셀">
      <div
        aria-live="polite"
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${visibleItemCount}, minmax(0, 1fr))`,
        }}
      >
        {visibleItems.map((item) => (
          <div key={getItemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      <nav
        aria-label="상품 캐러셀 탐색"
        className="mt-4 flex justify-end gap-2"
      >
        <button
          type="button"
          aria-label="이전 상품"
          disabled={activeSlide === 0}
          onClick={() => setCurrentSlide((slide) => Math.max(0, slide - 1))}
        >
          ←
        </button>
        <button
          type="button"
          aria-label="다음 상품"
          disabled={activeSlide === lastSlide}
          onClick={() =>
            setCurrentSlide((slide) => Math.min(lastSlide, slide + 1))
          }
        >
          →
        </button>
      </nav>
    </section>
  );
}
