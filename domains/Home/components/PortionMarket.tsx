import Link from 'next/link';

type PortionMarketProps = {
  href: string;
};

export function PortionMarket({ href }: PortionMarketProps) {
  return (
    <section className="bg-card mx-auto mt-16 w-full max-w-[1080px] px-8 py-12">
      <p className="font-heading text-primary text-[14px] uppercase">
        Little Portion Market
      </p>
      <h2 className="mt-2 text-[24px] font-bold">나눠 담는 마켓</h2>
      <p className="mt-2 text-[14px]">
        한 봉지가 많다면, 필요한 만큼 조금씩 함께 나눠요.
      </p>
      <Link href={href} className="mt-6 inline-block font-bold underline">
        소분 마켓 둘러보기 ↗
      </Link>
    </section>
  );
}
