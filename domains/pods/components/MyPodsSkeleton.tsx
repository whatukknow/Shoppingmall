/** 내 신청 팟(MyPodsView) 로딩 중 자리를 차지하는 스켈레톤입니다. */
export function MyPodsSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="내 신청 팟을 불러오는 중이에요."
      className="flex flex-col gap-8"
    >
      <div className="flex flex-col gap-2">
        <div
          className="h-8 w-72 animate-pulse rounded bg-[#e0ded6] md:h-9"
          aria-hidden="true"
        />
        <div
          className="h-5 w-56 animate-pulse rounded bg-[#e0ded6]"
          aria-hidden="true"
        />
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr]">
        {/* 사이드 메뉴 자리 (PC) */}
        <nav
          aria-label="내 정보 메뉴"
          className="hidden flex-col gap-3 md:flex"
          aria-hidden="true"
        >
          <div className="h-5 w-24 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]" />
        </nav>

        {/* 탭 자리 */}
        <div className="flex flex-col gap-6">
          <div className="flex gap-6" aria-hidden="true">
            <div className="h-4 w-16 animate-pulse rounded bg-[#e0ded6]" />
            <div className="h-4 w-12 animate-pulse rounded bg-[#e0ded6]" />
            <div className="h-4 w-12 animate-pulse rounded bg-[#e0ded6]" />
          </div>

          {/* 카드 3개 자리 */}
          <div className="flex flex-col gap-4">
            {[0, 1, 2].map((index) => (
              <div
                key={index}
                className="border-foreground/20 flex items-center gap-4 border p-6"
                aria-hidden="true"
              >
                <div className="h-[88px] w-[88px] shrink-0 animate-pulse rounded bg-[#e0ded6] md:h-[120px] md:w-[120px]" />
                <div className="flex flex-1 flex-col gap-2">
                  <div className="h-6 w-40 animate-pulse rounded bg-[#e0ded6]" />
                  <div className="h-4 w-28 animate-pulse rounded bg-[#e0ded6]" />
                  <div className="h-4 w-36 animate-pulse rounded bg-[#e0ded6]" />
                </div>
                <div className="hidden w-64 flex-col gap-3 md:flex">
                  <div className="min-h-12 animate-pulse rounded bg-[#e0ded6]" />
                  <div className="min-h-12 animate-pulse rounded bg-[#e0ded6]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
