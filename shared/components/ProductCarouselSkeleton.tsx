/** 홈 캐러셀 섹션 로딩 중 자리를 차지하는 스켈레톤입니다. */
export function ProductCarouselSkeleton() {
  return (
    <section
      aria-busy="true"
      aria-label="상품 목록을 불러오는 중이에요."
      className="max-w-1260px mx-auto w-full px-6 pt-14 md:px-0"
    >
      <div
        className="h-4 w-40 animate-pulse rounded bg-[#e0ded6]"
        aria-hidden="true"
      />
      <div
        className="mt-2 h-8 w-72 animate-pulse rounded bg-[#e0ded6]"
        aria-hidden="true"
      />
      <div className="mt-8 grid min-h-48 grid-cols-2 gap-6 px-10 sm:grid-cols-3 md:grid-cols-5">
        {Array.from({ length: 5 }, (_, index) => (
          <div key={index} aria-hidden="true">
            <div className="h-[150px] animate-pulse rounded bg-[#e0ded6] sm:h-[190px]" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-[#e0ded6]" />
            <div className="mt-2 h-4 w-2/3 animate-pulse rounded bg-[#e0ded6]" />
          </div>
        ))}
      </div>
    </section>
  );
}
