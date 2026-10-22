import type { MyPodApplication } from '@/domains/auth/users.types';
import type { PodRecruitment } from '@/domains/pods/pods.types';

/** 마감 시각을 M월 D일 오전/오후 h시 문자열로 바꾼다. */
export function formatDeadlineLabel(deadlineAt: string): string {
  const date = new Date(deadlineAt);
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hour = date.getHours();
  const period = hour < 12 ? '오전' : '오후';
  const hour12 = hour % 12 === 0 ? 12 : hour % 12;

  return `${month}월 ${day}일 ${period} ${hour12}시`;
}

/** 신청 내역을 모집 현황 카드(PodStatusCard) 모양으로 바꾼다. */
export function toRecruitment(app: MyPodApplication): PodRecruitment {
  return {
    productName: app.productName,
    imageUrl: app.imageUrl ?? '',
    optionLabel: app.optionLabel,
    currentCount: app.applicantCount,
    targetCount: app.capacity,
    deadlineLabel: formatDeadlineLabel(app.deadlineAt),
    status: 'matched',
  };
}

/** URL 로 넘어온 podId 의 초기 선택을 정한다. */
export function initialSelection(
  pods: MyPodApplication[],
  selectedId?: string,
): string[] {
  if (selectedId && pods.some((pod) => pod.podId === selectedId)) {
    return [selectedId];
  }

  return pods.map((pod) => pod.podId);
}

/** 선택한 팟의 개수와 합계(수량×단가)를 계산한다. */
export function summarize(
  pods: MyPodApplication[],
  selectedIds: string[],
): { count: number; totalPrice: number } {
  const selected = pods.filter((pod) => selectedIds.includes(pod.podId));

  return {
    count: selected.length,
    totalPrice: selected.reduce(
      (sum, pod) => sum + pod.quantity * pod.unitPrice,
      0,
    ),
  };
}
