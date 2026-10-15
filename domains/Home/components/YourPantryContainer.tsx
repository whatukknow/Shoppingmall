import Image from 'next/image';
import Link from 'next/link';
import type { ProductListItem } from '@/domains/product-list/productList.types';

type YourPantryContainerProps = {
  products: ProductListItem[];
};

export function YourPantryContainer({ products }: YourPantryContainerProps) {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4">
      <h2 className="text-[24px] font-bold">취향을 담는 장바구니</h2>
      <p className="mt-2 text-[14px]">필요한 만큼 골라 나만의 식탁을 채워요.</p>
      {products.length > 0 ? (
        <ul className="mt-6 grid grid-cols-2 gap-4 md:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <Link href={product.href} className="block">
                {product.imageUrl ? (
                  <Image
                    src={product.imageUrl}
                    alt={product.name}
                    width={252}
                    height={252}
                    className="aspect-square w-full object-cover"
                  />
                ) : (
                  <span className="bg-card block aspect-square" />
                )}
                <span className="mt-2 block font-bold">{product.name}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-6 text-[14px]">상품을 준비하고 있어요.</p>
      )}
    </section>
  );
}
