import type { HomeProduct } from '../data/homeProducts';
import Link from 'next/link';
import { HomeEditorialImage } from './HomeEditorialImage';

const freshPicks = [
  { illustration: 'cabbage', image: '/uploads/images/original-home/story-waffle.png', title: '한 줌의 초록', tags: '#와플 #브런치 #주말아침' },
  { illustration: 'tomatoes', image: '/uploads/images/original-home/fresh-pick-tomatoes.png', title: '토마토가 맛있는 한 끼', tags: '#산뜻한맛 #원디쉬' },
  { illustration: 'brusselsSprouts', image: '/uploads/images/original-home/fresh-pick-vegetables.png', title: '조금씩 담는 채소', tags: '#브런치 #고소한맛' },
] as const;

export function ShareProductsCarousel({
  products,
}: {
  products: HomeProduct[];
}) {
  return (
    <section className="mx-auto mt-14 w-full max-w-[1080px] px-5 md:mt-[56px] md:px-0">
      <p className="font-sans text-[11px] font-bold tracking-[0.08em] text-[#650f20]">
        01 / FRESH PICKS
      </p>
      <div className="mt-6 grid gap-7 sm:grid-cols-2 md:grid-cols-3 md:gap-6">
        {freshPicks.map((pick) => {
          const product = products.find((item) => item.illustration === pick.illustration);
          if (!product) return null;

          return (
            <Link key={pick.title} href="/products" className="group block">
              <div className="aspect-[344/250] overflow-hidden bg-[#fffdf7]">
                <HomeEditorialImage src={pick.image} alt={product.name} />
              </div>
              <h2 className="mt-4 text-base font-bold md:text-[17px]">{pick.title}</h2>
              <p className="mt-1 text-xs text-[#77766f]">{pick.tags}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
