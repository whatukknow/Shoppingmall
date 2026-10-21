import type { PodApplicationStatus } from '@/domains/pods/pods.types';
import { Badge } from './ui/badge';

// 서버나 호출부에서 전달된 상태를 사용자용 문구와 색상으로 바꿉니다.
const statuses = {
  recruiting: { label: '모집 중', variant: 'outline' },
  'payment-ready': { label: '결제 가능', variant: 'default' },
  paid: { label: '결제 완료', variant: 'secondary' },
  cancelled: { label: '내 신청 취소', variant: 'outline' },
} as const;

export type ApplicationStatus = PodApplicationStatus;

/** 전달된 신청 상태만 표시하며 상태 전환은 수행하지 않습니다. */
export function StatusBadge({
  status,
  className,
}: {
  status: ApplicationStatus;
  className?: string;
}) {
  const { label, variant } = statuses[status];
  return (
    <Badge variant={variant} className={className}>
      {label}
    </Badge>
  );
}
