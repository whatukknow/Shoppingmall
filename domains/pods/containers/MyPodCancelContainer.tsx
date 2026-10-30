'use client'; // 신청 취소 클릭 처리를 하는 경계

// TODO(session): 세션(쿠키)의 사용자 기준으로 취소

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/shared/components';
import { cancelPodApplication } from '../pods.api';

type MyPodCancelContainerProps = {
  podId: string;
  label?: string;
};

// 내 신청 취소 외곽선 버튼 — ProfileView 의 actionOutline 버튼 스타일
export default function MyPodCancelContainer({
  podId,
  label = 'Leave group',
}: MyPodCancelContainerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition(); // 비동기 대기 중 중복 클릭 차단

  const handleCancel = () => {
    startTransition(async () => {
      try {
        await cancelPodApplication(podId);
        router.refresh();
      } catch {
        // TODO: 취소 실패 안내 UI
      }
    });
  };

  return (
    <Button
      type="button"
      variant="actionOutline"
      size="touch"
      className="w-full"
      onClick={handleCancel}
      disabled={isPending}
      aria-busy={isPending}
    >
      {isPending ? 'Leaving…' : label}
    </Button>
  );
}
