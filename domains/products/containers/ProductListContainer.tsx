// 'use client' 없음: 서버에서 상품 목록 응답(ListResponse)의 list 를 조회하는 경계

import { ProductCatalogGrid } from '@/domains/products/components/ProductCatalogGrid';
import { getProducts } from '@/domains/products/products.api';

/** 상품 목록: 전체 상품 목록을 조회해 카탈로그 그리드를 그립니다. */
export default async function ProductListContainer() {
  const { list } = await getProducts();
  return <ProductCatalogGrid products={list} />;
}
