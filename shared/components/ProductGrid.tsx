import { ProductCard } from './ProductCard';
import { EmptyState } from './EmptyState';

type Product = {
  id: string;
  name: string;
  price: number;
  href: string;
  imageUrl?: string;
};

type ProductGridProps = {
  products: Product[];
  onAddToCart: (productId: string) => void;
  emptyTitle?: string;
  emptyDescription?: string;
};

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
