const tasteQuestions = [
  'Favorite ingredients',
  'Favorite flavors',
  'Shopping habits',
];

/** 취향 탐색에 사용할 질문을 미리 보여주는 소개 섹션입니다. */
export function TasteFinderSection() {
  return (
    <section
      id="find-your-taste"
      className="max-w-1260px mx-auto w-full px-6 pt-[72px] pb-[70px] md:px-0"
    >
      <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
        FIND YOUR TASTE
      </p>
      <h2 className="mt-2 text-[25px] leading-tight font-bold sm:text-[28px]">
        Find food that fits your taste
      </h2>
      <p className="mt-2 text-sm text-[#77766f]">
        Answer three questions to discover ingredients matched to your
        preferences.
      </p>

      <ol className="mt-10 grid grid-cols-1 gap-7 sm:grid-cols-3 sm:gap-10">
        {tasteQuestions.map((question, index) => (
          <li key={question} className="border-t border-[#650f20] pt-3">
            <p className="font-sans text-[11px] font-medium text-[#650f20]">
              0{index + 1}
            </p>
            <h3 className="mt-3 text-base font-medium">{question}</h3>
          </li>
        ))}
      </ol>
      <p className="mt-8 text-[11px] leading-5 text-[#77766f]">
        These suggestions match your answers to product tags. They are for
        exploration and are not a validated personality assessment.
      </p>
    </section>
  );
}
