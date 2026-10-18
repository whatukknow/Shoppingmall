import Image from 'next/image';
import type { CatalogProduct } from '../data/productCatalog';

export function ProductCatalogCard({ product }: { product: CatalogProduct }) {
  return (
    <article className="min-w-0 border-t border-primary/20 pt-4">
      <div className="relative aspect-square w-full overflow-hidden bg-muted/40">
        {product.image ? (
          <Image
            src={product.image}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 46vw, (max-width: 1024px) 30vw, 22vw"
            className="object-contain p-5"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-foreground/55">
            이미지 준비 중
          </div>
        )}
      </div>
      <div className="mt-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-foreground/65">{product.category}</p>
          <h2 className="mt-1 truncate text-base font-bold text-primary">{product.name}</h2>
        </div>
        <p className="shrink-0 text-sm font-semibold text-foreground">
          {product.samplePrice.toLocaleString('ko-KR')}원
        </p>
      </div>
      <p className="mt-1 text-[11px] text-foreground/55">시안 예시 금액</p>
    </article>
  );
}
