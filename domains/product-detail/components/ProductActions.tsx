// 소분 팟 바로 참여와 참여 가능한 팟 전체 보기 버튼 묶음
import { NavigationAction } from '@/shared/components';
import type { ProductDetail } from '../data/productDetail.types';

type ProductActionsProps = Pick<ProductDetail, 'id'>;

export default function ProductActions({ id }: ProductActionsProps) {
  const podsHref = `/pods/product/${encodeURIComponent(id)}`;

  return (
    <div className="flex w-full flex-col gap-3">
      <NavigationAction
        label="바로 참여"
        target={{ href: '#live-pods' }}
        className="border-primary bg-primary text-primary-foreground min-h-12 w-full border"
      />

      <NavigationAction
        label="나의 소분 신청하기"
        target={{ href: podsHref }}
        className="border-primary text-primary min-h-12 w-full border"
      />
    </div>
  );
}
