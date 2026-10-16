import { ProductCard } from './ProductCard';

type Product = {
  id: string;
  name: string;
  price: number;
  href: string;
};

type ProductGridProps = {
  products: Product[];
  onAddToCart: (productId: string) => void;
};

export default function ProductGrid({
  products,
  onAddToCart,
}: ProductGridProps) {
  return (
    <div className="grid grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard
          key={product.id}
          name={product.name}
          price={product.price}
          href={product.href}
          onAddToCart={() => onAddToCart(product.id)}
        />
      ))}
    </div>
  );
}
