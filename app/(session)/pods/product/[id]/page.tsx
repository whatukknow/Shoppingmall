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
    <div className="mx-auto w-full max-w-[1260px] px-6 py-10 text-[#242821]">
      <div className="grid grid-cols-1 items-start gap-8 min-[1260px]:grid-cols-[minmax(0,1fr)_320px]">
        <div className="flex min-w-0 flex-col gap-3">
          <h1 className="text-3xl font-bold">함께할 팟을 골라요</h1>
          {/* 제품 정보에서 제품명, 묶음 단위 */}
          <p className="text-[#77766f]">방울토마토 · 300g · 매칭 이후 결제</p>
          {/* 상품·수령 조건 입력 필드를 제거하고 팟 목록을 바로 표시합니다. */}
          <ul className="mt-5 flex flex-col gap-4">
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
        {/* 데스크톱에서는 위쪽 여백을 조절해 양쪽 제목의 아래선을 맞춥니다. */}
        <div className="min-w-0 min-[1260px]:sticky min-[1260px]:top-24 min-[1260px]:pt-1">
          <PodForm productId={id} myPotPageHref="url" />
        </div>
      </div>
    </div>
  );
}
