/** 브랜드가 제안하는 소분 장보기의 가치를 소개합니다. */
export function BrandStorySection() {
  return (
    <section
      id="brand-story"
      className="max-w-1260px mx-auto mt-[52px] flex w-full flex-col gap-5 px-7 py-8 sm:px-10 md:flex-row md:items-center md:justify-between md:py-10"
    >
      <div>
        <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
          A SMALLER, MORE THOUGHTFUL TABLE
        </p>
        <h2 className="mt-3 max-w-[620px] text-xl leading-[1.55] font-bold sm:text-2xl">
          Less to buy. More to enjoy together.
        </h2>
      </div>
      <p className="max-w-[475px] text-sm leading-6 text-[#77766f]">
        Check each buying group’s requirements and progress before you join.
      </p>
    </section>
  );
}
