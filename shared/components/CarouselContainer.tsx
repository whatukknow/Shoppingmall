'use client';

import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, type Key, type ReactNode } from 'react';

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
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = Number.isFinite(itemsPerSlide)
    ? Math.max(1, Math.floor(itemsPerSlide))
    : 1;
  const pageCount = Math.ceil(items.length / pageSize);

  if (items.length === 0) return null;

  const activePage = Math.min(currentPage, pageCount - 1);
  const visibleItems = items.slice(
    activePage * pageSize,
    (activePage + 1) * pageSize,
  );

  return (
    <section
      aria-label="상품 캐러셀"
      aria-roledescription="carousel"
      className="w-full"
    >
      <div
        aria-live="polite"
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${visibleItems.length}, minmax(0, 1fr))`,
        }}
      >
        {visibleItems.map((item) => (
          <div key={getItemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            aria-label="이전 상품 보기"
            className="text-foreground border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50"
            disabled={activePage === 0}
            onClick={() => setCurrentPage(activePage - 1)}
          >
            <ChevronLeft aria-hidden="true" size={18} />
          </button>
          <button
            type="button"
            aria-label="다음 상품 보기"
            className="text-foreground border-border hover:bg-muted flex size-9 items-center justify-center rounded-full border disabled:cursor-not-allowed disabled:opacity-50"
            disabled={activePage === pageCount - 1}
            onClick={() => setCurrentPage(activePage + 1)}
          >
            <ChevronRight aria-hidden="true" size={18} />
          </button>
        </div>
      )}
    </section>
  );
}
