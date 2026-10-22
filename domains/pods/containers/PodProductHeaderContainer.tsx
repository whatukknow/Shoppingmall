// 'use client' 없음: 서버에서 상품 정보를 조회해 팟 페이지 헤더 문구를 그리는 경계

import { notFound } from 'next/navigation';

import { ApiError } from '@/shared/lib/client';
import { getProductDetail } from '@/domains/products/products.api';

type PodProductHeaderContainerProps = {
  productId: string;
};

/** 상품별 팟 페이지 상단 문구: 상품명 · 묶음 단위 · 매칭 이후 결제 */
export default async function PodProductHeaderContainer({
  productId,
}: PodProductHeaderContainerProps) {
  let detail;
  try {
    detail = await getProductDetail(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  return (
    <p className="text-[#77766f]">
      {detail.name} · {detail.unit} · 매칭 이후 결제
    </p>
  );
}
