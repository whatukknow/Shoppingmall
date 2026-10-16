import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';

/** 공통 상품 그리드가 표시하는 최소 상품 정보입니다. */
type Product = {
  id: string;
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
};

/** 그리드 상품 목록과 상품 ID를 전달하는 담기 콜백입니다. */
type ProductGridProps = {
  products: Product[];
  onAddToCart: (productId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

/** 상품 카드를 반응형 그리드로 배치합니다. */
export default function ProductGrid({
  products,
  onAddToCart,
  emptyTitle = '상품이 없습니다',
  emptyDescription = '조건에 맞는 상품을 찾지 못했어요.',
}: ProductGridProps) {
  if (products.length === 0) {
    return <EmptyState title={emptyTitle} description={emptyDescription} />;
  }
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          href={product.href}
          imageUrl={product.imageUrl}
          onAddToCart={() => onAddToCart(product.id)}
        />
      ))}
    </div>
  );
}
