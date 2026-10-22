/** 상품 상세(ProductDetailView) 로딩 중 자리를 차지하는 스켈레톤입니다. */
export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="상품 정보를 불러오는 중이에요."
      className="flex-1 pb-24 font-sans"
    >
      <div className="mx-auto w-full max-w-[1080px] px-6 pt-10">
        <div
          className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]"
          aria-hidden="true"
        />

        <div
          className="mt-8 grid items-start gap-8 md:grid-cols-2"
          aria-hidden="true"
        >
          <div className="aspect-square w-full animate-pulse rounded bg-[#e0ded6]" />

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <div className="h-4 w-16 animate-pulse rounded bg-[#e0ded6]" />
              <div className="h-7 w-56 animate-pulse rounded bg-[#e0ded6]" />
              <div className="h-6 w-32 animate-pulse rounded bg-[#e0ded6]" />
            </div>
            <div className="flex flex-col gap-3">
              <div className="min-h-12 animate-pulse rounded bg-[#e0ded6]" />
              <div className="min-h-12 animate-pulse rounded bg-[#e0ded6]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
