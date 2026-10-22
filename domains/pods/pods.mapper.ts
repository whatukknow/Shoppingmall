import type { Pod, PodStatus, PodSummary } from './pods.types';
import type { Database } from '@/shared/lib/supabase/database.types';
import { toDeadlineLabel } from '@/shared/lib/mapper.utils';

type PodsRow = Database['public']['Tables']['pods']['Row'];

/**
 * DB pods.status → 화면 PodStatus ().
 * recruiting 만 open 이고, 그 외(matched/confirmed/closed/cancelled)는 모두 close.
 */
export function toPodStatus(status: string | null): PodStatus {
  return status === 'recruiting' ? 'open' : 'close';
}

/** GET products/:id/pods → Pod () */
export function toPod(
  row: PodsRow,
  productName: string,
  imageUrl: string,
  now?: Date,
): Pod {
  const summary = toPodSummary(row, productName, imageUrl, now);
  return {
    id: summary.id,
    productName: summary.productName,
    imageUrl: summary.imageUrl,
    currentCount: summary.currentCount,
    targetCount: summary.targetCount,
    deadlineLabel: summary.deadlineLabel,
    optionLabel: row.portion_label ?? '',
    status: toPodStatus(row.status),
  };
}

/** GET pods → PodSummary (홈 인기 팟, ) */
export function toPodSummary(
  row: PodsRow,
  productName: string,
  imageUrl: string,
  now?: Date,
): PodSummary {
  return {
    id: row.id,
    productId: row.product_id ?? '',
    productName,
    imageUrl,
    currentCount: row.member_count ?? 0,
    targetCount: row.capacity ?? 0,
    deadlineLabel:
      row.recruit_deadline === null
        ? ''
        : toDeadlineLabel(row.recruit_deadline, now),
  };
}
