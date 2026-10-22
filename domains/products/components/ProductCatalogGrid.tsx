import { ProductCatalogCard } from './ProductCatalogCard';
import type { ProductListItem } from '../products.types';

type ProductCatalogGridProps = {
  products: ProductListItem[];
};

/** 전달받은 모든 상품을 상품 ID 기준 상세 페이지 링크와 함께 5열 그리드로 표시합니다. */
export function ProductCatalogGrid({ products }: ProductCatalogGridProps) {
  if (products.length === 0) {
    return (
      <p className="text-muted-foreground min-h-48 py-12">
        등록된 상품이 없어요.
      </p>
    );
  }
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
      {products.map((product) => (
        <ProductCatalogCard key={product.id} product={product} />
      ))}
    </div>
  );
}
