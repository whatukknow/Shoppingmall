import { ProductCatalogCard } from './ProductCatalogCard';
import type { CatalogProduct } from '../data/productCatalog';

type ProductCatalogGridProps = {
  products: CatalogProduct[];
};

/** 전달받은 모든 상품을 상품 ID 기준 상세 페이지 링크와 함께 5열 그리드로 표시합니다. */
export function ProductCatalogGrid({ products }: ProductCatalogGridProps) {
  return (
    <div className="grid grid-cols-2 gap-x-5 gap-y-10 sm:grid-cols-3 lg:grid-cols-5 lg:gap-x-8">
      {products.map((product) => (
        <ProductCatalogCard key={product.id ?? `${product.name}-${product.category}`} product={product} />
      ))}
    </div>
  );
}
