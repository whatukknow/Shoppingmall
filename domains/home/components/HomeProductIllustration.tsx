import Image from 'next/image';
import type { HomeProduct } from '../data/homeProducts';

const productIllustrations: Record<HomeProduct['illustration'], string> = {
  melon: '/uploads/images/home/products/honeydew-melon.png',
  tomatoes: '/uploads/images/home/products/tomatoes.png',
  koreanMelon: '/uploads/images/home/products/korean-melon.png',
  pumpkin: '/uploads/images/home/products/pumpkin.png',
  orange: '/uploads/images/home/products/orange.png',
  grapes: '/uploads/images/home/products/grapes.png',
  strawberry: '/uploads/images/home/products/strawberry.png',
  onion: '/uploads/images/home/products/onion.png',
  cabbage: '/uploads/images/home/products/cabbage.png',
  scallion: '/uploads/images/home/products/scallion.png',
  peas: '/uploads/images/home/products/peas.png',
  brusselsSprouts: '/uploads/images/home/products/brussels-sprouts.png',
  apple: '/uploads/images/home/products/apple.png',
  mandarin: '/uploads/images/home/products/mandarin.png',
  watermelon: '/uploads/images/home/products/watermelon.png',
  beefSteak: '/uploads/images/home/products/illustration-beef-steak.png',
  porkSteak: '/uploads/images/home/products/illustration-pork-steak.png',
  chickenDrumstick:
    '/uploads/images/home/products/illustration-chicken-drumstick.png',
  blueberries: '/uploads/images/home/products/illustration-blueberries.png',
  dragonFruitIllustration:
    '/uploads/images/home/products/illustration-dragon-fruit.png',
  peachIllustration: '/uploads/images/home/products/illustration-peach.png',
};

/** 제공받은 투명 배경 식재료 이미지를 공통 크기로 표시합니다. */
export function HomeProductIllustration({
  kind,
}: {
  kind: HomeProduct['illustration'];
}) {
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
