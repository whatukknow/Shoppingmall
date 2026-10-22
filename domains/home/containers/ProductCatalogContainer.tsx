// 'use client' 없음: 서버에서 전체 상품 카탈로그를 조회하는 경계

import { ProductCarousel } from '@/domains/home/components/ProductCarousel';
import { getProductCatalog } from '@/domains/products/products.api';

/** 상품 목록 섹션: 전체 상품 카탈로그를 조회해 캐러셀을 그립니다. */
export default async function ProductCatalogContainer() {
  const productCatalog = await getProductCatalog();
  return <ProductCarousel products={productCatalog} />;
}
