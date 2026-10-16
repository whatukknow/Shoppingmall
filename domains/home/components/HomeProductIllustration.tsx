import Image from 'next/image';
import type { HomeProduct } from '../data/homeProducts';

const productIllustrations: Record<HomeProduct['illustration'], string> = {
  melon: '/images/home/products/honeydew-melon.png',
  tomatoes: '/images/home/products/tomatoes.png',
  koreanMelon: '/images/home/products/korean-melon.png',
  pumpkin: '/images/home/products/pumpkin.png',
  orange: '/images/home/products/orange.png',
  grapes: '/images/home/products/grapes.png',
  strawberry: '/images/home/products/strawberry.png',
  onion: '/images/home/products/onion.png',
  cabbage: '/images/home/products/cabbage.png',
  scallion: '/images/home/products/scallion.png',
  peas: '/images/home/products/peas.png',
  brusselsSprouts: '/images/home/products/brussels-sprouts.png',
  apple: '/images/home/products/apple.png',
  mandarin: '/images/home/products/mandarin.png',
  watermelon: '/images/home/products/watermelon.png',
  beefSteak: '/images/home/products/illustration-beef-steak.png',
  friedEgg: '/images/home/products/illustration-fried-egg.png',
  porkSteak: '/images/home/products/illustration-pork-steak.png',
  chickenDrumstick: '/images/home/products/illustration-chicken-drumstick.png',
  blueberries: '/images/home/products/illustration-blueberries.png',
  dragonFruitIllustration: '/images/home/products/illustration-dragon-fruit.png',
  peachIllustration: '/images/home/products/illustration-peach.png',
};

/** 제공받은 투명 배경 식재료 이미지를 공통 크기로 표시합니다. */
export function HomeProductIllustration({ kind }: { kind: HomeProduct['illustration'] }) {
  return (
    <div className="relative size-[138px] sm:size-[170px]" aria-hidden="true">
      <Image
        src={productIllustrations[kind]}
        alt=""
        fill
        sizes="(max-width: 640px) 138px, 170px"
        className="object-contain"
      />
    </div>
  );
}
