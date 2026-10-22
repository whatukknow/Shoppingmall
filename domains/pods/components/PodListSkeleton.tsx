/** 상품별 팟 목록(PodListContainer) 로딩 중 자리를 차지하는 스켈레톤입니다. */
export function PodListSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="팟 목록을 불러오는 중이에요."
      className="mt-5 flex flex-col gap-4"
    >
      {Array.from({ length: 2 }, (_, index) => (
        <div
          key={index}
          aria-hidden="true"
          className="flex items-center gap-4 border-y border-[#e0ded6] p-5 sm:p-6"
        >
          <div className="h-22 w-22 shrink-0 animate-pulse rounded bg-[#e0ded6]" />
          <div className="flex flex-col gap-2">
            <div className="h-4 w-32 animate-pulse rounded bg-[#e0ded6]" />
            <div className="h-3 w-24 animate-pulse rounded bg-[#e0ded6]" />
          </div>
        </div>
      ))}
    </div>
  );
}
