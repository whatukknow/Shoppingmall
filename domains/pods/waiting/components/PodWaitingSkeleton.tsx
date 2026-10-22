/** 대기 화면 로딩 중 스켈레톤입니다. */
export function PodWaitingSkeleton() {
  return (
    <main aria-busy="true" className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <div className="mb-8">
        <div className="h-9 w-2/5 animate-pulse rounded bg-[#e0ded6]" />
        <div className="mt-2 h-5 w-1/2 animate-pulse rounded bg-[#e0ded6]" />
      </div>

      {/* 진행바 자리 */}
      <div className="h-16 animate-pulse rounded bg-[#e0ded6]" />

      <div className="mt-8 grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <div className="mb-6 h-8 w-32 animate-pulse rounded bg-[#e0ded6]" />
          <div className="flex flex-col gap-6">
            <div className="h-64 animate-pulse rounded-2xl bg-[#e0ded6]" />
            <div className="h-64 animate-pulse rounded-2xl bg-[#e0ded6]" />
          </div>
        </section>

        <aside>
          <div className="mb-6 h-8 w-32 animate-pulse rounded bg-[#e0ded6]" />
          <div className="h-64 animate-pulse rounded-2xl bg-[#e0ded6]" />
        </aside>
      </div>
    </main>
  );
}
