/** 상품 카탈로그 그리드(ProductCatalogGrid) 로딩 중 자리를 차지하는 스켈레톤입니다. */
export function ProductGridSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading products."
      className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8"
    >
      {Array.from({ length: 10 }, (_, index) => (
        <div
          key={index}
          className="border-primary/20 min-w-0 border-t pt-4"
          aria-hidden="true"
        >
          <div className="aspect-square w-full animate-pulse rounded bg-[#e0ded6]" />
          <div className="mt-3 flex items-start justify-between gap-3">
            <div className="min-w-0">
              <div className="h-3 w-10 animate-pulse rounded bg-[#e0ded6]" />
              <div className="mt-2 h-4 w-24 animate-pulse rounded bg-[#e0ded6]" />
            </div>
            <div className="h-4 w-14 shrink-0 animate-pulse rounded bg-[#e0ded6]" />
          </div>
        </div>
      ))}
    </div>
  );
}
