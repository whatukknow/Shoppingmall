// 'use client' 없음: 서버에서 상품 목록 응답(ListResponse)의 total 을 조회하는 경계

import { getProducts } from '@/domains/products/products.api';

// ProductListContainer 와 같은 요청에서 getProducts() 를 한 번 더 호출합니다(목업이라 허용).
/** 상품 개수: 목록 조회 응답의 total 을 표시합니다. */
export default async function ProductCountContainer() {
  const { total } = await getProducts();
  return <p className="text-foreground/70 pb-1 text-sm">{total} products</p>;
}
