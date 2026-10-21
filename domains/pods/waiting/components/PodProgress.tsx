// 전체 진행 단계
// 신청 완료 -> 모집중 -> 모집 완료 -> 결제
import type { PodRecruitment } from '@/domains/pods/pods.types';

type PodProgressProps = Pick<PodRecruitment, 'status'>;

const steps = ['신청 완료', '모집 중', '모집 완료', '결제'];

export default function PodProgress({ status }: PodProgressProps) {
  // 배열의 순서는 0부터 시작
  const currentStep = status === 'matched' ? 2 : 1;

  return (
    <ol aria-label="팟 진행 단계" className="grid grid-cols-4 gap-2">
      {steps.map((step, index) => (
        <li
          key={step}
          aria-current={index === currentStep ? 'step' : undefined}
          className={`border-t-4 pt-3 text-center text-sm ${
            index <= currentStep
              ? 'border-[#601025] font-bold text-[#601025]'
              : 'border-[#601025]/15 text-[#601025]/50'
          }`}
        >
          <span className="block">{index < currentStep ? '✓' : index + 1}</span>
          <span className="mt-1 block">{step}</span>
        </li>
      ))}
    </ol>
  );
}
