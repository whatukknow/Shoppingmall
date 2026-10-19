'use client';

import Image from 'next/image';

interface PotItemProps {
  potId: string;
  title: string;
  state: string;
  imageURL: string;
}

export default function PotItem({
  potId,
  title,
  imageURL,
}: PotItemProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-3 border p-2 md:flex-row" key={potId}>
      <div className="flex flex-row gap-3">
        <Image
          src={imageURL}
          width={100}
          height={100}
          alt="상품 이미지"
          className="shrink-0"
        />
        <div className="flex min-w-0 flex-1 flex-col gap-1">
          <h3 className="text-xl font-bold">{title}</h3>
          <p>모집 중 · 신청 가능한 팟</p>
        </div>
      </div>
      <div className="shrink-0">
        <button
          className="w-full border p-3 text-center md:min-w-75"
          onClick={() => {
            // potId를 이용하여 참여 API 호출
          }}
        >
          이 팟에 참여
        </button>
      </div>
    </div>
  );
}
