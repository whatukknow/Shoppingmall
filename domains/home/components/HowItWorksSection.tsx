const steps = [
  {
    number: '01',
    title: '품목을 둘러봐요',
    description: '관심 있는 식재료와 상품 상세에서 함께 나눌 조건을 확인해요.',
  },
  {
    number: '02',
    title: '소분 팟에 참여해요',
    description: '원하는 팟에 신청하고 모집이 채워질 때까지 기다려요.',
  },
  {
    number: '03',
    title: '모집 완료 후 결제해요',
    description: '조건이 충족되면 결제가 열려요. 결제 완료 후 나눔이 진행됩니다.',
  },
];

export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="mx-auto mt-5 w-full max-w-[1260px] px-6 md:px-0"
    >
      <p className="font-sans text-[11px] font-medium tracking-[0.08em] text-[#650f20]">
        HOW IT WORKS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        소분은 이렇게 시작해요
      </h2>
      <p className="mt-2 text-sm text-[#77766f]">
        참여부터 결제까지, 필요한 순간을 차근차근 안내합니다.
      </p>

      <div className="mt-8 border-y border-[#e0ded6] py-7">
        <ol className="grid gap-8 md:grid-cols-3 md:gap-0">
          {steps.map((step, index) => (
            <li
              key={step.number}
              className={`min-h-[120px] ${index > 0 ? 'md:border-l md:border-[#e0ded6] md:pl-[30px]' : ''} ${index === 0 ? 'md:pr-[30px]' : ''}`}
            >
              <p className="font-sans text-[13px] font-medium text-[#650f20]">
                {step.number}
              </p>
              <h3 className="mt-3 text-[19px] leading-7 font-bold sm:text-[21px]">
                {step.title}
              </h3>
              <p className="mt-3 max-w-[360px] text-[13px] leading-6 text-[#77766f]">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
