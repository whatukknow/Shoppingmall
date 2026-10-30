import Link from 'next/link';
import { Button, FormField } from '@/shared/components';
import type { PodCreateValues } from '@/domains/pods/pods.types';

type PodCreateErrors = Partial<Record<keyof PodCreateValues, string>>;

type PodFormProps = {
  values: PodCreateValues;
  errors: PodCreateErrors;
  isPending: boolean;
  onChange: (field: keyof PodCreateValues, value: string) => void;
  onSubmit: () => void;
};

// 'use client' 없음. 받은 값·오류·핸들러대로 그리기만 함 (LoginContainer/LoginForm 패턴)
export default function PodForm({
  values,
  errors,
  isPending,
  onChange,
  onSubmit,
}: PodFormProps): React.JSX.Element {
  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-2xl font-bold">Can’t find a group?</h2>
      {/* 데스크톱에서는 왼쪽 상품 안내 높이만큼 띄워 두 카드의 상단을 맞춥니다. */}
      <div className="flex flex-col gap-5 border-y border-[#e0ded6] p-5 min-[1260px]:mt-11 sm:p-6">
        <div className="text-[13px] leading-6 text-[#77766f]">
          <p>Start a new buying group.</p>
          <p>The group stays open even if its creator leaves.</p>
        </div>
        <FormField
          label="Group size"
          value={values.targetCount}
          error={errors.targetCount}
          disabled={isPending}
          onChange={(event) => onChange('targetCount', event.target.value)}
        />
        <FormField
          label="Deadline"
          value={values.deadline}
          error={errors.deadline}
          disabled={isPending}
          onChange={(event) => onChange('deadline', event.target.value)}
        />
        <Button
          type="button"
          size="touch"
          className="w-full rounded-none bg-[#650f20] text-[13px] font-medium text-white hover:bg-[#650f20]/90"
          disabled={isPending}
          aria-busy={isPending || undefined}
          onClick={onSubmit}
        >
          {isPending ? 'Creating group…' : 'Create a group'}
        </Button>
        <Link
          href="/mypage/pods"
          className="group/button hover:bg-primary/5 inline-flex min-h-12 w-full shrink-0 items-center justify-center gap-2 rounded-none border border-[#650f20] bg-transparent bg-clip-padding px-4 py-3 text-sm font-medium whitespace-normal whitespace-nowrap text-[#650f20] transition-all outline-none select-none"
        >
          My buying groups
        </Link>
      </div>
    </div>
  );
}
