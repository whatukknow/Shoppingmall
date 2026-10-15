'use client';

import { useState } from 'react';
import type { Key, ReactNode } from 'react';

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
  const [currentSlide, setCurrentSlide] = useState(0);
  const slideSize = Math.max(1, Math.floor(itemsPerSlide) || 1);
  const slideCount = Math.ceil(items.length / slideSize);
  const activeSlide = Math.min(currentSlide, Math.max(0, slideCount - 1));
  const visibleItems = items.slice(
    activeSlide * slideSize,
    (activeSlide + 1) * slideSize,
  );

  return (
    <div>
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: `repeat(${slideSize}, minmax(0, 1fr))` }}
      >
        {visibleItems.map((item) => (
          <div key={getItemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      <div
        role="group"
        aria-label="상품 페이지 선택"
        className="mt-4 flex items-center justify-center gap-4"
      >
        <button
          type="button"
          aria-label="이전 상품"
          disabled={activeSlide === 0}
          onClick={() => setCurrentSlide(activeSlide - 1)}
        >
          이전
        </button>
        <span aria-live="polite">
          {slideCount === 0 ? 0 : activeSlide + 1} / {slideCount}
        </span>
        <button
          type="button"
          aria-label="다음 상품"
          disabled={activeSlide >= slideCount - 1}
          onClick={() => setCurrentSlide(activeSlide + 1)}
        >
          다음
        </button>
      </div>
    </div>
  );
}
