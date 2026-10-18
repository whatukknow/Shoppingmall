import { FormField } from '@/shared/components';
import PotItem from '@/domains/pot/PotItem';

export default function PotPage(): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 p-3">
      <h1 className="text-4xl font-bold">함께할 팟을 골라요</h1>
      <p>방울토마토 · 3 00 g 예시 · 매칭 이후 결제</p>
      <div className="flex flex-row gap-3">
        <div className="flex flex-2 flex-col gap-3">
          <div className="flex flex-row gap-3">
            <FormField className="flex-1" label="상품" />
            <FormField className="flex-1" label="수령 조건" />
          </div>
          <ul className="flex flex-col gap-3">
            <PotItem title="방울토마토 팟 A" />
            <PotItem title="방울토마토 팟 B" />
          </ul>
        </div>
        <div className="bg-card flex flex-1 flex-col gap-3 p-3">
          <h2 className="text-2xl font-bold">맞는 팟이 없다면</h2>
          <div>
            <p>새 팟을 신청할 수 있어요.</p>
            <p>생성자가 신청을 취소해 도 팟 자체는 유지돼요.</p>
          </div>
          <FormField label="상품 및 소분량" />
          <FormField label="수령 정보" />
          <button>새 팟 신청</button>
          <button>내 신청 팟 보기</button>
        </div>
      </div>
    </div>
  );
}
