// 'use client' 없음: 서버에서 상품 상세와 모집 중인 팟을 함께 조회하는 경계

import { notFound } from 'next/navigation';

import { ApiError } from '@/shared/lib/client';
import { getProductDetail } from '@/domains/products/products.api';
import {
  localizeProductDetail,
  translateProductText,
} from '@/domains/products/product-copy.en';
import { getProductPods } from '@/domains/pods/pods.api';
import type { ListResponse } from '@/shared/lib/api.types';
import type { Pod } from '@/domains/pods/pods.types';
import ProductDetailView from '@/domains/product-detail/components/ProductDetailPage';
import type {
  LivePod,
  ProductDetail,
} from '@/domains/product-detail/data/productDetail.types';

type ProductDetailContainerProps = {
  id: string;
};

/** 상품 상세: id 로 상세를 조회해 404 처리 후 상세 뷰를 그립니다. */
export default async function ProductDetailContainer({
  id,
}: ProductDetailContainerProps) {
  let detail;
  let podList: ListResponse<Pod>;
  try {
    detail = await getProductDetail(id);
    podList =
      detail.isPurchasable === false
        ? { list: [], total: 0, limit: 0, offset: 0 }
        : await getProductPods(detail.id, { status: 'open' });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  detail = localizeProductDetail(detail);

  const pods: LivePod[] = podList.list.map((pod) => ({
    id: pod.id,
    title: `${translateProductText(pod.productName)} · ${translateProductText(pod.optionLabel)}`,
    cropName: translateProductText(pod.productName),
    description: translateProductText(pod.deadlineLabel),
    status: 'recruiting',
    applicantCount: pod.currentCount,
    capacity: pod.targetCount,
  }));

  // 응답의 description(문자열)은 현재 표시 위치가 없어 매핑하지 않습니다.
  const product: ProductDetail = {
    id: detail.id,
    catalogId: detail.catalogId,
    isPurchasable: detail.isPurchasable,
    name: detail.name,
    category: detail.category,
    images: detail.images,

    price: detail.price,
    discountRate: detail.discountRate,
    farmName: detail.farmName,
    unit: detail.unit,
    isSample: detail.isSample ?? false,

    description: {
      farmName: detail.farmName,
      farmInfo: detail.farmInfo,
      imageUrl: detail.farmImageUrl,
      basicInfo: detail.basicInfo,
      tips: detail.tips,
    },
  };

  return <ProductDetailView product={product} pods={pods} />;
}
