import Link from 'next/link';
import type { ProductListItem } from '@/domains/product-list/productList.types';

type YourPantryContainerProps = {
  products: ProductListItem[];
};

export function YourPantryContainer({ products }: YourPantryContainerProps) {
  return (
    <section
      aria-labelledby="your-pantry-heading"
      className="mx-auto mt-16 w-full max-w-[1080px] px-4"
    >
      <h2 id="your-pantry-heading" className="mb-6 text-2xl font-bold">
        Your Pantry
      </h2>
      {products.length > 0 ? (
        <ul className="grid gap-4 sm:grid-cols-3">
          {products.map((product) => (
            <li key={product.id} className="bg-card p-6">
              <Link href={product.href} className="font-bold hover:underline">
                {product.name}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p>상품을 준비하고 있어요.</p>
      )}
    </section>
  );
}
