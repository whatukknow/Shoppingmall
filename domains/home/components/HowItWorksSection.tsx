const steps = [
  {
    number: '01',
    title: 'Find your ingredients',
    description:
      'Browse ingredients and check the details of each shared order.',
  },
  {
    number: '02',
    title: 'Join a buying group',
    description:
      'Join a group for the product you want and wait for it to fill up.',
  },
  {
    number: '03',
    title: 'Pay when the group is full',
    description:
      'Payment opens once the group meets its requirements. Your order proceeds after payment.',
  },
];

/** 참여부터 결제까지 소분 이용 단계를 안내합니다. */
export function HowItWorksSection() {
  return (
    <section
      id="how-it-works"
      className="max-w-1260px mx-auto mt-5 w-full px-6 md:px-0"
    >
      <p className="font-sans text-[15.6px] font-bold tracking-[0.08em] text-[#650f20] md:text-[17.16px]">
        HOW IT WORKS
      </p>
      <h2 className="mt-2 text-[26px] leading-tight font-bold sm:text-[30px]">
        Smaller portions, in three steps
      </h2>
      <p className="mt-2 text-sm text-[#77766f]">
        From joining a group to paying for your share.
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
