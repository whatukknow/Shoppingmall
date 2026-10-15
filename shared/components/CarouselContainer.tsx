'use client';

import { useState, type Key, type ReactNode } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';

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
  const activePage = Math.min(currentPage, pageCount - 1);
  const visibleItems = items.slice(
    activePage * pageSize,
    (activePage + 1) * pageSize,
  );

  if (items.length === 0) return null;

  return (
    <section aria-label="콘텐츠 캐러셀" className="flex flex-col gap-4">
      <div
        className="grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${pageSize}, minmax(0, 1fr))`,
        }}
      >
        {visibleItems.map((item) => (
          <div key={getItemKey(item)}>{renderItem(item)}</div>
        ))}
      </div>

      {pageCount > 1 && (
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="이전 슬라이드"
            disabled={activePage === 0}
            onClick={() => setCurrentPage(activePage - 1)}
          >
            <ChevronLeft aria-hidden="true" />
          </Button>
          <Button
            type="button"
            variant="outline"
            size="icon"
            aria-label="다음 슬라이드"
            disabled={activePage === pageCount - 1}
            onClick={() => setCurrentPage(activePage + 1)}
          >
            <ChevronRight aria-hidden="true" />
          </Button>
        </div>
      )}
    </section>
  );
}
