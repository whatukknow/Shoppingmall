import { foodLabel } from '@/shared/lib/food-label';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from './ui/button';
import { formatPrice } from '@/shared/utils/formatPrice';

/** 상품 정보, 상세 페이지 주소와 장바구니 담기 동작을 전달받습니다. */
type ProductCardProps = {
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
  onAddToCart: () => void;
};

/** 상품 이미지·이름·가격·담기 버튼을 표시하는 공통 카드입니다. */
export function ProductCard({
  name,
  price,
  href,
  imageUrl,
  onAddToCart,
}: ProductCardProps) {
  return (
    <article
      aria-label={`${foodLabel(name)} product`}
      className="text-foreground relative flex w-full min-w-0 flex-col gap-2 font-sans"
    >
      {/* 이미지 영역: 카드 너비에 맞춘 정사각형이며, object-cover로 영역을 채웁니다. */}
      <Link
        href={href}
        className="relative block aspect-square w-full overflow-hidden"
      >
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={foodLabel(name)}
            fill
            sizes="(max-width: 1440px) 25vw, 336px"
            className="object-cover"
          />
        ) : (
          <span className="sr-only">{foodLabel(name)} image coming soon</span>
        )}
      </Link>

      {/* 상품명은 상세 페이지로 연결하고, 가격은 공통 포맷으로 표시합니다. */}
      <h3 className="min-w-0 text-sm leading-[22px] font-medium wrap-anywhere">
        <Link href={href}>{foodLabel(name)}</Link>
      </h3>
      <p className="text-[17px] leading-[1.45] font-bold whitespace-nowrap">
        {formatPrice(price)}
      </p>
      {/* 담기 버튼: 부모에서 전달한 onAddToCart를 실행합니다. */}
      <Button
        type="button"
        variant="actionOutline"
        size="touch"
        className="mt-auto min-h-10 w-full py-2"
        aria-label={`Add ${foodLabel(name)} to cart`}
        onClick={onAddToCart}
      >
        + Add
      </Button>
    </article>
  );
}

// 중복 관련 기능 제거 완료
