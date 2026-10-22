// 'use client' 없음: 서버에서 상품 목록 응답(ListResponse)을 조회하는 경계

import { ProductCarousel } from '@/domains/home/components/ProductCarousel';
import { getProducts } from '@/domains/products/products.api';

/** 상품 목록 섹션: 전체 상품 목록을 조회해 캐러셀을 그립니다. */
export default async function ProductCatalogContainer() {
  const { list } = await getProducts();
  return <ProductCarousel products={list} />;
}
