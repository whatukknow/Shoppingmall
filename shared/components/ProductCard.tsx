import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { Button } from './ui/button';
import { formatPrice } from '@/shared/utils/formatPrice';

type ProductCardProps = {
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
  onAddToCart: () => void;
};

/* agent 도움 받은 부분 */
export function ProductCard({
  name,
  price,
  href,
  imageUrl,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article
      aria-label={`${name} 상품`}
      className="text-foreground relative flex w-[252px] flex-col gap-2 font-sans"
    >
      <Link
        href={href}
        className="bg-card relative block aspect-square w-full overflow-hidden"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="252px"
            className="object-cover"
          />
        ) : (
          <span className="sr-only">{name} 이미지 준비 중</span>
        )}
      </Link>

      <div className="flex items-center justify-between">
        <h3 className="text-[14px] leading-[1.45] font-bold">
          <Link href={href}>{name}</Link>
        </h3>
        <Button
          variant="ghost"
          size="icon"
          aria-label={`${name} 장바구니에 담기`}
          onClick={onAddToCart}
        >
          <ShoppingCart className="size-[26px]" aria-hidden="true" />
        </Button>
      </div>
      <p className="text-[17px] leading-[1.45] font-bold whitespace-nowrap">
        {formatPrice(price)}
      </p>
      <p className="px-20"></p>
    </article>
  );
}


// 중복 관련 기능 제거 완료