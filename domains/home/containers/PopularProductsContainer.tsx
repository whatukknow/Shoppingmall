// 'use client' 없음: 서버에서 인기 상품을 조회하는 경계

import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { getHomeProducts } from '@/domains/home/home.api';

/** 인기 상품 섹션: 인기 상품을 조회해 캐러셀을 그립니다. */
export default async function PopularProductsContainer() {
  const { popularProducts } = await getHomeProducts();
  return <PopularProductsCarousel products={popularProducts} />;
}
