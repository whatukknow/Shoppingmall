import { Button } from '@/shared/components';
import Image from 'next/image';

interface PotCompletePageProps {
  params: Promise<{ id: string }>;
}

export default async function PotCompletePage({
  params,
}: PotCompletePageProps): Promise<React.JSX.Element> {
  const { id } = await params;

  // TODO: 사용자의 완료된 팟이 있는지 pot id로 API로 확인
  return (
    <div className="flex flex-col gap-3 p-10">
      <h1 className="text-4xl font-bold">팟이 매칭되었어요</h1>
      <div className="flex flex-row gap-10">
        <div className="bg-accent flex flex-2 flex-col gap-3 p-3">
          <h2 className="text-3xl font-bold">방울토마토 팟 A</h2>
          <ul>
            <li>신청한 소분 상품을 확인하고</li>
            <li>결제를 진행해 주세요.</li>
          </ul>
          <div className="mt-auto flex"></div>
          <Button
            type="button"
            variant="default"
            size="touch"
            className="min-h-10 w-full py-2"
          >
            신청 내역 확인후 결제
          </Button>
          <Button
            type="button"
            variant="actionOutline"
            size="touch"
            className="min-h-10 w-full py-2"
          >
            내 신청 팟으로
          </Button>
        </div>
        <div className="flex flex-col gap-3">
          <Image
            className="shrink-0 border"
            src={''}
            alt="이미지"
            width={300}
            height={200}
          />
          <ul className="bg-accent flex flex-col gap-3 p-3">
            <li className="text-2xl font-bold">확인할 신청</li>
            <li>방울토마토 · 300g </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
