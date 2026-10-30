/** 회원 정보(ProfileView) 로딩 중 자리를 차지하는 스켈레톤입니다. */
export function ProfileSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Loading your account."
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

      <div className="grid gap-8 md:grid-cols-[180px_1fr_260px]">
        {/* 사이드 메뉴 자리 (PC) */}
        <nav
          aria-label="Account menu"
          className="hidden flex-col gap-3 md:flex"
          aria-hidden="true"
        >
          <div className="h-5 w-24 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-4 w-20 animate-pulse rounded bg-[#e0ded6]" />
        </nav>

        {/* 기본 정보 자리 */}
        <section className="border-foreground/20 flex flex-col gap-4 border p-6">
          <div
            className="h-6 w-24 animate-pulse rounded bg-[#e0ded6]"
            aria-hidden="true"
          />
          {[0, 1, 2].map((index) => (
            <div key={index} className="flex flex-col gap-1">
              <div
                className="h-4 w-16 animate-pulse rounded bg-[#e0ded6]"
                aria-hidden="true"
              />
              <div
                className="h-5 w-48 animate-pulse rounded bg-[#e0ded6]"
                aria-hidden="true"
              />
            </div>
          ))}
        </section>

        {/* 내 장보기 자리 */}
        <div className="flex flex-col gap-4">
          <div
            className="h-6 w-24 animate-pulse rounded bg-[#e0ded6]"
            aria-hidden="true"
          />
          <div className="flex flex-col gap-4">
            <div className="min-h-12 animate-pulse rounded bg-[#e0ded6]" />
            <div className="min-h-12 animate-pulse rounded bg-[#e0ded6]" />
          </div>
        </div>
      </div>
    </div>
  );
}
