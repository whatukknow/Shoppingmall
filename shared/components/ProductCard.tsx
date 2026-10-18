import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { formatPrice } from '@/shared/utils/formatPrice';

type ProductCardProps = {
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
  onAddToCart: () => void;
};

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
      className="text-foreground relative flex w-full min-w-0 flex-col gap-2 font-sans"
    >
      <Link
        href={href}
        className="relative block aspect-square w-full overflow-hidden"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={name}
            fill
            sizes="(max-width: 1440px) 25vw, 336px"
            className="object-cover"
          />
        ) : (
          <span className="sr-only">{name} 이미지 준비 중</span>
        )}
      </Link>

      <h3 className="min-w-0 text-sm leading-[22px] font-medium wrap-anywhere">
        <Link href={href}>{name}</Link>
      </h3>
      <p className="text-[17px] leading-[1.45] font-bold whitespace-nowrap">
        {formatPrice(price)}
      </p>
      <Button
        type="button"
        variant="actionOutline"
        size="touch"
        className="mt-auto min-h-10 w-full py-2"
        aria-label={`${name} 장바구니에 담기`}
        onClick={onAddToCart}
      >
        + 담기
      </Button>
    </article>
  );
}

// 중복 관련 기능 제거 완료
