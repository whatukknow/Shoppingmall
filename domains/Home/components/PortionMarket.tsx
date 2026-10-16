import Link from 'next/link';

type PortionMarketProps = {
  href: string;
};

export function PortionMarket({ href }: PortionMarketProps) {
  return (
    <section
      aria-labelledby="portion-market-title"
      className="mx-auto mt-20 grid w-full max-w-[1080px] grid-cols-2"
    >
      <div className="bg-primary text-background flex flex-col justify-center gap-8 p-12">
        <p className="text-[16px] leading-[1.6]">
          한 봉지의 채소, 커다란 빵 한 덩이.
          <br />
          좋아하는 재료도 혼자 먹기엔 많을 때가 있죠.
        </p>

        <h2
          id="portion-market-title"
          className="font-heading text-[48px] leading-[1.1] font-bold"
        >
          A LITTLE,
          <br />
          TOGETHER.
        </h2>

        <p className="text-[16px] leading-[1.6]">
          한두 사람의 식탁에 필요한 만큼만,
          <br />
          취향이 맞는 이웃과 장보기의 양을 나눠보세요.
          <br />
          냉장고의 부담은 덜고, 식탁의 즐거움은 더해요.
        </p>
      </div>

      <div className="text-foreground relative flex min-h-[420px] flex-col justify-center gap-8 overflow-hidden p-12">
        <div className="relative">
          <p className="text-[32px] leading-[1.4] font-bold">
            한 봉지가 많다면,
            <br />
            조금씩 같이.
          </p>

          <Link
            href={href}
            className="mt-8 inline-block text-[16px] font-bold underline underline-offset-4"
          >
            소분 마켓 둘러보기 ↗
          </Link>
        </div>
      </div>
    </section>
  );
}
