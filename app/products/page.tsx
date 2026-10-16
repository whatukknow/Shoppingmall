/*전체 상품 리스트 */

import Link from 'next/link';

export default function ProductListPage() {
  return (
    <main className="bg-background min-h-screen font-sans">
      <header className="mx-auto w-full max-w-[1080px] px-4 pt-12">
        <div className="flex flex-col items-center gap-4 text-center">
          <p className="font-heading text-primary text-[48px] leading-[1.06]">
            SUNDAY MORNING MARKET
          </p>

          <p className="text-foreground text-[14px] leading-[1.45] font-bold">
            ISSUE 01 | 느긋하게 차리는, 나의 한 접시
          </p>
        </div>

        <Link
          href="/"
          className="text-foreground mt-12 inline-block text-[14px]"
        >
          ← 오늘의 식탁으로
        </Link>
      </header>

      <section className="mx-auto mt-16 w-full max-w-[1080px] px-4">
        <p className="font-heading text-foreground text-[12px]">
          02 / YOUR PANTRY
        </p>

        <h1 className="text-primary mt-4 text-[48px] leading-[1.45] font-bold">
          전체상품
        </h1>

        <p className="text-foreground mt-4 text-[20px] leading-[1.5]">
          작은 식탁을 채우는, 서른여덟 가지 맛.
        </p>
      </section>
      <section
        aria-label="전체 상품 목록"
        className="mx-auto mt-14 w-full max-w-[1080px]"
      >
        {/* 다음 단계에서 38개 상품 그리드를 넣을 위치 */}
      </section>
    </main>
  );
}
