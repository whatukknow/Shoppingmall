export default function PodWaitingPage() {
  return (
    <main className="mx-auto w-full max-w-[1260px] px-6 py-10">
      <header className="mb-8">
        <h1 className="text-3xl font-bold">
          함께 나눌 이웃을 기다리고 있어요
        </h1>
        <p className="mt-2">
          신청이 접수됐어요. 팟이 완성되면 결제할 수 있어요.
        </p>
      </header>

      {/* 진행 단계: PodProgress */}

      <div className="mt-8 grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
        <section className="min-w-0">
          <h2 className="text-2xl font-bold">모집 현황</h2>
          {/* 상품과 모집 상태: PodStatusCard */}
        </section>

        <aside className="min-[1260px]:sticky min-[1260px]:top-24">
          <h2 className="text-2xl font-bold">내 신청 정보</h2>
          {/* 신청 요약: PodApplicationSummary */}
        </aside>
      </div>
    </main>
  );
}