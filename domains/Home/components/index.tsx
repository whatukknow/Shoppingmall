import Link from 'next/link';
import type { ReactNode } from 'react';
import { CurationCarousel } from '@/shared/components/CurationCarousel';

export function MainBannerCuration() {
  return (
    <CurationCarousel
      slides={[
        {
          subtitle: 'ISSUE 01',
          title: '느긋하게 차리는,\n나의 한 접시',
          description: '한두 사람의 식탁에, 취향은 가득.',
        },
      ]}
    />
  );
}

export function StoryCardsContainer() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4">
      <h2 className="text-foreground text-[24px] font-bold">
        오늘의 식탁, 어디로 떠나볼까요?
      </h2>
    </section>
  );
}

export function FreshPickCardContainer() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4">
      <h2 className="text-foreground text-[24px] font-bold">01 Fresh Picks</h2>
    </section>
  );
}

export function YourPantryContainer({ products }: { products: ReactNode[] }) {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4">
      <h2 className="text-foreground text-[24px] font-bold">
        취향을 담는 장바구니
      </h2>
      {products.length > 0 && <div className="mt-6">{products}</div>}
    </section>
  );
}

export function PortionMarket({ href }: { href: string }) {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4 pb-16">
      <h2 className="text-foreground text-[24px] font-bold">소분 마켓</h2>
      <Link href={href} className="mt-4 inline-block font-bold">
        소분 마켓 둘러보기 ↗
      </Link>
    </section>
  );
}
