import { PortionMarketImage } from './PortionMarketImage';

type PortionMarketHeroProps = {
  imageUrl?: string;
};

// 상단: 소개 글(왼쪽) + 매장 사진(오른쪽)
export function PortionMarketHero({ imageUrl }: PortionMarketHeroProps) {
  return (
    <section className="mt-6 grid grid-cols-2 items-stretch">
      <div className="flex flex-col justify-center gap-4 py-10 pr-10">
        <p className="font-heading text-[28px] uppercase">
          A little. Together.
        </p>
        <h1 className="text-[32px] leading-[1.35] font-bold">
          한 봉지가 많다면,
          <br />
          조금씩 같이.
        </h1>
        <p className="text-[14px] leading-[1.6]">
          작은 식탁을 위한 장보기의 새로운 방식.
          <br />
          양이 부담스러운 대신, 필요한 만큼 나누는 즐거움을 제안해요.
        </p>
      </div>

      <PortionMarketImage
        src={imageUrl}
        alt="소분마켓 식료품 진열대"
        sizes="540px"
        priority
        className="min-h-[320px]"
      />
    </section>
  );
}
