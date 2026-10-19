import { FormField } from '@/shared/components';
import PodItem from '@/domains/pods/product/components/PodItem';
import PodForm from '@/domains/pods/product/components/PodForm';

interface PotPageProps {
  params: Promise<{ id: string }>;
}

export default async function PotPage({
  params,
}: PotPageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  // TODO: productId로 제품 정보 및 Pot 정보 가져오기

  return (
    <div className="flex flex-col gap-3 p-3">
      <h1 className="text-4xl font-bold">함께할 팟을 골라요</h1>
      {/* 제품 정보에서 제품명, 묶음 단위 */}
      <p>방울토마토 · 300g · 매칭 이후 결제</p>
      <div className="flex flex-col gap-3 md:flex-row">
        <div className="flex flex-2 flex-col gap-3">
          <div className="flex flex-col gap-3 md:flex-row">
            <FormField className="flex-1" label="상품" />
            <FormField className="flex-1" label="수령 조건" />
          </div>
          <ul className="flex flex-col gap-3">
            <PodItem
              title="방울토마토 팟 A"
              potId="1"
              state="모집 중 · 신청 가능한 팟"
              imageURL="/uploads/images/products/mandarin.png"
            />
            <PodItem
              title="방울토마토 팟 B"
              potId="2"
              state="모집 중 · 신청 가능한 팟"
              imageURL="/uploads/images/products/mandarin.png"
            />
          </ul>
        </div>
        <div className="bg-card pd-[calc(1rem+env(safe-area-inset-bottom))] sticky bottom-0 z-10 p-3 md:flex md:flex-1">
          <PodForm productId={id} myPotPageHref="url" />
        </div>
      </div>
    </div>
  );
}
