const tasteQuestions = ['좋아하는 식재료', '선호하는 맛', '장보기 준비 방식'];

/** 취향 탐색에 사용할 질문을 미리 보여주는 소개 섹션입니다. */
export function TasteFinderSection() {
  return (
    <section
      id="find-your-taste"
      className="max-w-1260px mx-auto w-full px-6 pt-[72px] pb-[70px] md:px-0"
    >
      <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] md:text-[17.16px] text-[#650f20]">
        FIND YOUR TASTE
      </p>
      <h2 className="mt-2 text-[25px] leading-tight font-bold sm:text-[28px]">
        내 취향으로 발견하는 큐레이션
      </h2>
      <p className="mt-2 text-sm text-[#77766f]">
        세 가지 질문의 답을 상품 태그와 연결해, 취향에 맞는 품목을 찾아봐요.
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
        답변을 바탕으로 상품 태그를 연결하는 큐레이션 예시이며, 검증된 성향
        진단을 의미하지 않습니다.
      </p>
    </section>
  );
}
