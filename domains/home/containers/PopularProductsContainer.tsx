// 'use client' 없음: 서버에서 인기 소분팟을 조회하는 경계

import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { getPods } from '@/domains/pods/pods.api';

/** 인기 상품 섹션: 베스트 소분팟을 조회해 캐러셀을 그립니다. */
export default async function PopularProductsContainer() {
  const pods = await getPods();
  const products = pods.map((pod) => ({
    // 카드 클릭 시 /pods/product/{productId} 로 이동하도록 상품 id 를 씁니다.
    id: pod.productId,
    name: pod.productName,
    imageUrl: pod.imageUrl,
  }));
  return <PopularProductsCarousel products={products} />;
}
