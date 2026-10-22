// 'use client' 없음: 서버에서 상품 상세 응답(ProductDetailResponse)을 조회하는 경계

import { notFound } from 'next/navigation';

import { ApiError } from '@/shared/lib/client';
import { getProductDetail } from '@/domains/products/products.api';
import ProductDetailView from '@/domains/product-detail/components/ProductDetailPage';
import type { ProductDetail } from '@/domains/product-detail/data/productDetail.types';

type ProductDetailContainerProps = {
  id: string;
};

/** 상품 상세: id 로 상세를 조회해 404 처리 후 상세 뷰를 그립니다. */
export default async function ProductDetailContainer({
  id,
}: ProductDetailContainerProps) {
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
