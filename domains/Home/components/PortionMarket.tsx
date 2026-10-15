import Link from 'next/link';

type PortionMarketProps = {
  href: string;
};

export function PortionMarket({ href }: PortionMarketProps) {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4 pb-16">
      <Link
        href={href}
        className="bg-card hover:bg-secondary block p-8 transition-colors"
      >
        <h2 className="text-2xl font-bold">소분 마켓</h2>
        <p className="mt-2">필요한 만큼 나누어 담아보세요.</p>
      </Link>
    </section>
  );
}
