import { Suspense } from 'react';
import { notFound } from 'next/navigation';

import { ApiError } from '@/shared/lib/client';
import { getProductDetail } from '@/domains/products/products.api';
import ProductDetailView from '@/domains/product-detail/components/ProductDetailPage';
import type { ProductDetail } from '@/domains/product-detail/data/productDetail.types';

type PageProps = {
  params: Promise<{ id: string }>;
};

export default function Page({ params }: PageProps) {
  return (
    <Suspense
      fallback={
        <p role="status" className="px-6 py-10">
          상품 정보를 불러오는 중입니다.
        </p>
      }
    >
      <ProductDetailContent params={params} />
    </Suspense>
  );
}

async function ProductDetailContent({ params }: PageProps) {
  const { id } = await params;

  let detail;
  try {
    detail = await getProductDetail(id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  // 응답의 description(문자열)은 현재 표시 위치가 없어 매핑하지 않습니다.
  const product: ProductDetail = {
    id: detail.id,
    name: detail.name,
    category: detail.category,
    images: detail.images,

    price: detail.price,
    discountRate: detail.discountRate,
    farmName: detail.farmName,
    unit: detail.unit,
    isSample: false,

    description: {
      farmName: detail.farmName,
      farmInfo: detail.farmInfo,
      imageUrl: detail.farmImageUrl,
      basicInfo: detail.basicInfo,
      tips: detail.tips,
    },
  };

  return <ProductDetailView product={product} pods={null} />;
}
