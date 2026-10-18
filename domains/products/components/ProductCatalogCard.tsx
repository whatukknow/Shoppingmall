import Image from 'next/image';
import Link from 'next/link';
import type { CatalogProduct } from '../data/productCatalog';

export function ProductCatalogCard({ product }: { product: CatalogProduct }) {
  return (
    <Link
      href={`/products/${product.id}`}
      aria-label={`${product.name} 상세 보기`}
      className="group focus-visible:outline-primary block focus-visible:outline-2 focus-visible:outline-offset-4"
    >
      <article className="border-primary/20 min-w-0 border-t pt-4">
        <div className="bg-muted/40 relative aspect-square w-full overflow-hidden">
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
              className="object-contain p-5"
            />
          ) : (
            <div className="text-foreground/55 flex h-full items-center justify-center text-sm">
              이미지 준비 중
            </div>
          )}
        </div>
        <div className="mt-3 flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="text-foreground/65 text-xs">{product.category}</p>
            <h2 className="text-primary mt-1 truncate text-base font-bold group-hover:underline">
              {product.name}
            </h2>
          </div>
          <p className="text-foreground shrink-0 text-sm font-semibold">
            {product.samplePrice.toLocaleString('ko-KR')}원
          </p>
        </div>
        <p className="text-foreground/55 mt-1 text-[11px]">시안 예시 금액</p>
      </article>
    </Link>
  );
}
