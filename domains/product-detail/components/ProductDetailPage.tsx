import Link from 'next/link';
import type { ProductDetail, LivePod } from '../data/productDetail.types';

import ProductGallery from '@/domains/product-detail/components/ProductGallery';
import ProductInfo from '@/domains/product-detail/components/ProductInfo';
import ProductActions from '@/domains/product-detail/components/ProductActions';
import ProductDetailNav from '@/domains/product-detail/components/ProductDetailNav';
import ProductDescription from '@/domains/product-detail/components/ProductDescription';
import LivePodSection from './LivePodSection';

type ProductDetailViewProps = {
  product: ProductDetail;
  pods: LivePod[] | null;
};

export default function ProductDetailView({
  product,
  pods,
}: ProductDetailViewProps) {
  return (
    <main className="flex-1 pb-24 font-sans">
      <div className="mx-auto w-full max-w-[1080px] px-6 pt-10">
        <Link href="/products" className="text-sm underline underline-offset-4">
          ← 전체 상품
        </Link>

        {/* 상단: 상품 이미지 + 상품 정보 + 액션 */}
        <div className="mt-8 grid items-start gap-8 md:grid-cols-2">
          <ProductGallery
            key={product.id}
            name={product.name}
            images={product.images}
          />

          <div className="flex flex-col gap-6">
            <ProductInfo
              name={product.name}
              category={product.category}
              farmName={product.farmName}
              price={product.price}
              discountRate={product.discountRate}
              unit={product.unit}
            />

            {product.isSample && (
              <p className="text-muted-foreground text-sm">
                시안 예시 금액이며 실제 판매·재고 정보가 아닙니다.
              </p>
            )}

            <ProductActions id={product.id} />
          </div>
        </div>

        {/* 상품 설명 / 모집 중인 팟 이동 메뉴 */}
        <div
          className="sticky z-30 mt-12"
          style={{
            top: 'var(--shop-header-height, 81px)',
            backgroundColor: 'var(--butter, #fff8d6)',
          }}
        >
          <ProductDetailNav />
        </div>

        {/* 하단: 상품 설명 + 팟 목록 */}
        <div className="space-y-12 pt-10">
          <ProductDescription description={product.description} />

          <LivePodSection productId={product.id} pods={pods} />
        </div>
      </div>
    </main>
  );
}
