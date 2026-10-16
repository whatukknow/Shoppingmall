import { CarouselContainer } from '@/shared/components/CarouselContainer';
import { ProductCard } from '@/shared/components/ProductCard';

export type PantryProduct = {
  id: string;
  name: string;
  price: number;
  href: string;
};

type YourPantryProps = {
  products: PantryProduct[];
  onAddToCart: (productId: string) => void;
};

export function YourPantry({ products, onAddToCart }: YourPantryProps) {
  return (
    <section
      aria-labelledby="your-pantry-title"
      className="mx-auto mt-20 w-full max-w-[1080px]"
    >
      <div className="mb-8 flex items-end justify-between">
        <div>
          <p className="font-heading text-foreground text-[12px] font-bold">
            02 / YOUR PANTRY
          </p>
          <h2
            id="your-pantry-title"
            className="text-primary mt-4 text-[38px] leading-[1.4] font-bold"
          >
            취향을 담는 장바구니
          </h2>
        </div>
      </div>

      <CarouselContainer
        ariaLabel="취향을 담는 장바구니 상품"
        items={products}
        itemsPerSlide={4}
        getItemKey={(product) => product.id}
        renderItem={(product) => (
          <ProductCard
            name={product.name}
            price={product.price}
            href={product.href}
            onAddToCart={() => onAddToCart(product.id)}
          />
        )}
      />
    </section>
  );
}
