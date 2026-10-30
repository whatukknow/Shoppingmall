import {
  findCatalogProduct,
  catalogImages,
} from '@/domains/products/catalog/catalog';
// 'use client' 없음: 서버에서 인기 소분팟을 조회하는 경계

import { PopularProductsCarousel } from '@/domains/home/components/PopularProductsCarousel';
import { getPods } from '@/domains/pods/pods.api';

/** 인기 상품 섹션: 베스트 소분팟을 조회해 캐러셀을 그립니다. */
export default async function PopularProductsContainer() {
  const pods = await getPods();
  const products = pods.flatMap((pod) => {
    const item = findCatalogProduct(pod.productName);
    return item
      ? [
          {
            id: pod.productId,
            name: item.name,
            imageUrl: catalogImages(item.id)!.recommendation,
          },
        ]
      : [];
  });
  return <PopularProductsCarousel products={products} />;
}
