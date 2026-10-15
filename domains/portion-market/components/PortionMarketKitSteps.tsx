import type { PortionMarketStep } from '../portionMarket.types';
import { PortionMarketImage } from './PortionMarketImage';

type PortionMarketKitStepsProps = {
  kitName: string;
  steps: PortionMarketStep[];
};

// 01~03: 키트 하나의 조리 순서를 사진과 설명으로 보여줌
export function PortionMarketKitSteps({
  kitName,
  steps,
}: PortionMarketKitStepsProps) {
  // 단계가 하나도 없으면 이 영역을 통째로 숨김
  if (steps.length === 0) return null;

  return (
    <section className="mt-16">
      <h2 className="text-[24px] font-bold">양은 가볍게, 취향은 넉넉하게.</h2>
      <p className="mt-2 text-[14px] leading-[1.6]">
        {kitName}, 이렇게 차려요.
      </p>

      <ol className="mt-6 grid grid-cols-3 gap-4">
        {steps.map((step) => (
          <li key={step.no}>
            <PortionMarketImage
              src={step.imageUrl}
              alt={step.title}
              sizes="340px"
              className="aspect-square w-full"
            />
            <p className="mt-2 text-[14px] font-bold">
              {step.no} / {step.title}
            </p>
            <p className="mt-1 text-[12px] leading-[1.5]">{step.body}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
