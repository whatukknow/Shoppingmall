'use client'; // 참여 신청 처리를 하는 경계

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';

import { Button } from '@/shared/components';
import { applyPod } from '@/domains/pods/pods.api';
import type { Pod } from '@/domains/pods/pods.types';

type PodApplyContainerProps = {
  pod: Pod;
};

/** 팟 참여 신청 버튼: open 팟에만 참여할 수 있고 성공 시 목록을 새로 고칩니다. */
export default function PodApplyContainer({ pod }: PodApplyContainerProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleApply = () => {
    // TODO(session): 로그인 사용자 기준 — 세션 도입 시 인증 확인
    startTransition(async () => {
      try {
        await applyPod(pod.id);
        router.refresh(); // 신청 후 인원 수 갱신
      } catch {
        // TODO: 참여 실패 안내 UI
      }
    });
  };

  const isJoined = pod.isJoined === true;
  const isClosed = pod.status === 'close';

  return (
    <Button
      type="button"
      size="touch"
      className="w-full rounded-none bg-[#650f20] text-[13px] font-medium text-white hover:bg-[#650f20]/90"
      disabled={isJoined || isClosed || isPending}
      aria-busy={isPending || undefined}
      onClick={handleApply}
    >
      {isJoined
        ? '참여 중'
        : isClosed
          ? '모집 완료'
          : isPending
            ? '참여 신청 중…'
            : '이 팟에 참여'}
    </Button>
  );
}
