import { formatPrice } from '@/shared/utils/formatPrice';
import { foodLabel } from '@/shared/lib/food-label';
import Image from 'next/image';
import Link from 'next/link';
import type { ProductListItem } from '../products.types';

/** 배경이 투명한 농산물 사진과 시안용 상품 정보를 보여주는 카드입니다. */
export function ProductCatalogCard({ product }: { product: ProductListItem }) {
  const cardContent = (
    <>
      <div className="relative aspect-square w-full overflow-hidden">
        {product.imageUrl ? (
          <Image
            src={product.imageUrl}
            alt={foodLabel(product.name)}
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
            className="object-contain p-5"
          />
        ) : (
          <div className="bg-primary/5 text-foreground/50 flex size-full items-center justify-center text-sm">
            Image coming soon
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-foreground/65 text-xs">
            {foodLabel(product.category)}
          </p>
          <h2 className="text-primary mt-1 truncate text-base font-bold">
            {foodLabel(product.name)}
          </h2>
        </div>
        <p className="text-foreground shrink-0 text-sm font-semibold">
          {formatPrice(product.price)}
        </p>
      </div>
    </>
  );

  return (
    <article className="border-primary/20 min-w-0 border-t pt-4">
      <Link
        href={`/products/${encodeURIComponent(product.id)}`}
        className="focus-visible:outline-primary block text-inherit focus-visible:outline-2 focus-visible:outline-offset-4"
      >
        {cardContent}
      </Link>
    </article>
  );
}
