'use client'; // 입력값·검증·제출 처리를 하는 경계

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';

import PodForm from '@/domains/pods/product/components/PodForm';
import { createPod } from '@/domains/pods/pods.api';
import type { PodCreateValues } from '@/domains/pods/pods.types';

type PodCreateErrors = Partial<Record<keyof PodCreateValues, string>>;

type PodCreateContainerProps = {
  productId: string;
};

/** 검증 실패 오류를 만듭니다. targetCount 정수 2~20, deadline YYYY-MM-DD 형식. */
function validate(values: PodCreateValues): PodCreateErrors {
  const nextErrors: PodCreateErrors = {};

  const targetCount = Number(values.targetCount);
  if (
    !/^\d+$/.test(values.targetCount) ||
    !Number.isInteger(targetCount) ||
    targetCount < 2 ||
    targetCount > 20
  ) {
    nextErrors.targetCount =
      '목표 인원은 2명 이상 20명 이하의 정수로 입력해 주세요.';
  }

  if (!/^\d{4}-\d{2}-\d{2}$/.test(values.deadline)) {
    nextErrors.deadline = '마감 기한은 YYYY-MM-DD 형식으로 입력해 주세요.';
  } else {
    const [year, month, day] = values.deadline.split('-').map(Number);
    const date = new Date(year, month - 1, day);
    if (
      date.getFullYear() !== year ||
      date.getMonth() !== month - 1 ||
      date.getDate() !== day
    ) {
      nextErrors.deadline = '마감 기한은 YYYY-MM-DD 형식으로 입력해 주세요.';
    }
  }

  return nextErrors;
}

/** 새 팟 생성: 검증을 통과하면 생성 API 를 호출하고 서버 데이터를 새로 고칩니다. */
export default function PodCreateContainer({
  productId,
}: PodCreateContainerProps) {
  const router = useRouter();

  const [values, setValues] = useState<PodCreateValues>({
    targetCount: '',
    deadline: '',
  });
  const [errors, setErrors] = useState<PodCreateErrors>({});
  const [isPending, startTransition] = useTransition();

  const handleChange = (field: keyof PodCreateValues, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleSubmit = () => {
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (nextErrors.targetCount || nextErrors.deadline) return;

    // TODO(session): 로그인 사용자 기준 — 세션 도입 시 인증 확인
    startTransition(async () => {
      try {
        await createPod(productId, {
          targetCount: Number(values.targetCount),
          deadline: values.deadline,
        });
        setValues({ targetCount: '', deadline: '' });
        router.refresh();
      } catch {
        // TODO: 생성 실패 안내 UI
      }
    });
  };

  return (
    <PodForm
      values={values}
      errors={errors}
      isPending={isPending}
      onChange={handleChange}
      onSubmit={handleSubmit}
    />
  );
}
