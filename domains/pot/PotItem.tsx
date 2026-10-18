import Image from 'next/image';

interface PotItemProps {
  title: string;
}

export default function PotItem({ title }: PotItemProps): React.JSX.Element {
  return (
    <div className="flex flex-row gap-3 border p-2">
      <Image src={''} alt="" className="h-25 w-25 shrink-0" />
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-xl font-bold">{title}</h3>
        <p>모집 중 · 신청 가능한 팟</p>
        <p>팟 구성·매칭 기준은 추후 확정</p>
      </div>
      <div className="shrink-0">
        <button className="min-w-75 text-center">이 팟에 참여</button>
      </div>
    </div>
  );
}
