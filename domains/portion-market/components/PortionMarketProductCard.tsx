import Link from 'next/link';
import type { PortionMarketProduct } from '../portionMarket.types';
import { PortionMarketImage } from './PortionMarketImage';

type PortionMarketProductCardProps = {
  product: PortionMarketProduct;
};

// 중단·하단 캐러셀에 들어가는 카드. 누르면 상품 상세 페이지로 이동
export function PortionMarketProductCard({
  product,
}: PortionMarketProductCardProps) {
  return (
    <Link href={`/products/${product.id}`} className="group block">
      <PortionMarketImage
        src={product.imageUrl}
        alt={product.name}
        sizes="340px"
        className="aspect-square w-full"
      />
      <p className="mt-2 text-[14px] font-bold group-hover:underline">
        {product.name}
      </p>
      <p className="mt-1 text-[12px] leading-[1.5]">{product.description}</p>
    </Link>
  );
}
