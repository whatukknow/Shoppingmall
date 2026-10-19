/*전체 상품 리스트 */

import Link from 'next/link';
import { ProductCatalogGrid } from '@/domains/products/components/ProductCatalogGrid';
import { getProductCatalog } from '@/domains/products/products.api';

export default async function ProductListPage() {
  const productCatalog = await getProductCatalog();
  return (
    <main className="bg-background flex-1 pb-24 font-sans">
      <header className="mx-auto w-full max-w-[1440px] px-6 pt-14">
        <div className="border-foreground/15 flex items-end justify-between border-b pb-8">
          <div></div>

          <Link
            href="/"
            className="text-foreground inline-block text-[14px] underline underline-offset-4"
          >
            ← 오늘의 식탁으로
          </Link>
        </div>
      </header>

      <section
        aria-labelledby="product-list-title"
        className="mx-auto mt-16 w-full max-w-[1440px] px-6"
      >
        <div className="flex items-end justify-between gap-8">
          <div>
            <p className="font-heading text-foreground text-[12px]">
              02 / YOUR PANTRY
            </p>

            <h1
              id="product-list-title"
              className="text-primary mt-4 text-[48px] leading-[1.2] font-bold"
            >
              전체 상품
            </h1>

            <p className="text-foreground mt-4 text-[20px] leading-[1.5]">
              작은 식탁에 필요한 만큼, 천천히 골라보세요.
            </p>
          </div>

          <p className="text-foreground/70 pb-1 text-sm">
            {productCatalog.length}개 상품 예시
          </p>
        </div>
      </section>
      <section
        aria-labelledby="product-list-title"
        aria-label="전체 상품 목록"
        className="mx-auto mt-12 w-full max-w-[1440px] px-6"
      >
        <p className="border-primary/20 text-foreground/75 mb-8 border-y py-4 text-sm leading-6">
          시안 확인을 위한 예시 목록입니다. 상품명과 금액은 실제 판매·재고
          정보가 아닙니다.
        </p>
        <ProductCatalogGrid products={productCatalog} />
      </section>
    </main>
  );
}
