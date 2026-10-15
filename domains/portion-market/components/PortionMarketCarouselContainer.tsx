'use client'; // 함수(renderItem)를 캐러셀에 넘겨야 해서 클라이언트 경계가 필요

import { CarouselContainer } from '@/shared/components/CarouselContainer';
import { PortionMarketProductCard } from '@/domains/portion-market/components/PortionMarketProductCard';
import type { PortionMarketProduct } from '@/domains/portion-market/portionMarket.types';

type PortionMarketCarouselContainerProps = {
  products: PortionMarketProduct[];
};

// 소분마켓 상품 캐러셀: 3장씩 보여주고 화살표로 넘김
export default function PortionMarketCarouselContainer({
  products,
}: PortionMarketCarouselContainerProps) {
  return (
    <CarouselContainer
      items={products}
      itemsPerSlide={3}
      getItemKey={(product) => product.id}
      renderItem={(product) => <PortionMarketProductCard product={product} />}
    />
  );
}
