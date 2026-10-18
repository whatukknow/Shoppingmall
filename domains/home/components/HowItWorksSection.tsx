import Link from 'next/link';
import type { HomeProduct } from '../data/homeProducts';
import { HomeEditorialImage } from './HomeEditorialImage';

const tableStories = [
  {
    illustration: 'friedEgg',
    image: '/uploads/images/original-home/story-brunch.png',
    title: '우리 집이 좋아하는 카페.',
    description: '빵과 달걀을 곁들여, 느긋하게 차리는 한 접시.',
  },
  {
    illustration: 'tomatoes',
    image: '/uploads/images/original-home/story-pasta.png',
    title: '오늘은, 파스타가 있는 식탁.',
    description: '따뜻한 파스타부터 산뜻한 한 접시까지.',
  },
  {
    illustration: 'grapes',
    image: '/uploads/images/original-home/story-picnic-sandwich.png',
    title: '들고, 한강으로.',
    description: '샌드위치 하나 챙겨, 강바람이 있는 자리로.',
  },
] as const;

export function HowItWorksSection({ products }: { products: HomeProduct[] }) {
  return (
    <section id="todays-table" className="mx-auto mt-14 w-full max-w-[1080px] px-5 md:mt-[88px] md:px-0">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2 className="text-[24px] leading-[1.3] font-bold sm:text-[30px]">
            오늘의 식탁, 어디로 떠나볼까요?
          </h2>
          <p className="mt-2 text-[12px] leading-5 text-[#77766f]">
            집에서 즐기는 카페 한 접시부터, 한강으로 들고 나가는 샌드위치까지.
          </p>
        </div>
        <Link className="shrink-0 pb-1 text-xs underline underline-offset-4" href="/products">
          더보기 &gt;
        </Link>
      </div>
      <div className="mt-7 grid gap-7 sm:grid-cols-2 md:mt-10 md:grid-cols-3 md:gap-6">
        {tableStories.map((story) => {
          const product = products.find((item) => item.illustration === story.illustration);
          if (!product) return null;

          return (
            <Link key={story.title} href="/products" className="group block">
              <div className="aspect-[344/250] overflow-hidden bg-[#fffdf7]">
                <HomeEditorialImage src={story.image} alt={product.name} />
              </div>
              <h3 className="mt-4 text-base leading-6 font-bold md:text-[17px]">
                {story.title}
              </h3>
              <p className="mt-1 text-xs leading-5 text-[#77766f]">{story.description}</p>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
