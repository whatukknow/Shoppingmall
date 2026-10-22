// 'use client' 없음: 서버에서 상품별 팟 목록을 조회하는 경계

import { notFound } from 'next/navigation';

import { ApiError } from '@/shared/lib/client';
import PodItem from '@/domains/pods/product/components/PodItem';
import { getProductPods } from '@/domains/pods/pods.api';

type PodListContainerProps = {
  productId: string;
};

/** 상품별 팟 목록: status all 로 조회해 팟 항목을 그립니다. */
export default async function PodListContainer({
  productId,
}: PodListContainerProps) {
  let response;
  try {
    response = await getProductPods(productId);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    throw error;
  }

  if (response.list.length === 0) {
    return <p className="mt-5 text-sm text-[#77766f]">등록된 팟이 없어요.</p>;
  }

  return (
    <ul className="mt-5 flex flex-col gap-4">
      {response.list.map((pod) => (
        <PodItem key={pod.id} pod={pod} />
      ))}
    </ul>
  );
}
