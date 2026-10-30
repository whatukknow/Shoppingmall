import type { Database } from '@/shared/lib/supabase/database.types';
import type { ListResponse } from '@/shared/lib/api.types';

type UploadsRow = Database['public']['Tables']['uploads']['Row'];

/**
 * DB 업로드 경로를 이미지 URL 로 변환합니다.
 * uploads.external_url ?? '/uploads/' + uploads.location
 */
export function toImageUrl(upload: UploadsRow | null): string {
  if (!upload) return '';
  return upload.external_url ?? `/uploads/${upload.location ?? ''}`;
}

/** 마감 안내 라벨: '오늘 마감' | 'D-N' | '마감' */
export function toDeadlineLabel(recruitDeadline: string, now?: Date): string {
  const nowDate = now ?? new Date();
  const deadline = new Date(recruitDeadline);
  if (Number.isNaN(deadline.getTime())) return 'Closed';

  // Asia/Seoul 기준 캘린더 일자(YYYY-MM-DD)로 D-day 를 계산합니다.
  // 서버 시간대와 무관하게 동일한 결과를 보장합니다.
  const kstDateFmt = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Asia/Seoul',
  });
  const toUtcMidnight = (s: string) => Date.parse(`${s}T00:00:00Z`);
  // KST 자정(00:00:00) 마감은 일자 형태 값으로 보고 그 날의 끝까지 유효하게 한다.
  const kstTimeFmt = new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Seoul',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const isKstMidnight =
    deadline.getTime() % 60000 === 0 &&
    kstTimeFmt.format(deadline) === '00:00:00';
  const effectiveDeadline = isKstMidnight
    ? toUtcMidnight(kstDateFmt.format(deadline)) + 24 * 60 * 60 * 1000 - 1
    : deadline.getTime();
  if (effectiveDeadline <= nowDate.getTime()) return 'Closed';

  const diffDays = Math.round(
    (toUtcMidnight(kstDateFmt.format(deadline)) -
      toUtcMidnight(kstDateFmt.format(nowDate))) /
      (1000 * 60 * 60 * 24),
  );

  if (diffDays > 0) return `D-${diffDays}`;
  if (diffDays === 0) return 'Closes today';
  return 'Closed';
}

/** 목록 응답 봉투 */
export function toListResponse<T>(
  list: T[],
  total: number,
  limit: number,
  offset: number,
): ListResponse<T> {
  return { list, total, limit, offset };
}

/**
 * supabase .range() 인수를 만듭니다. limit 0 (전체)이면 null 을 반환합니다.
 */
export function toRange(
  limit: number,
  offset: number,
): { from: number; to: number } | null {
  // 음수·비정수 입력 방어
  const safeLimit = Math.max(0, Math.trunc(limit));
  const safeOffset = Math.max(0, Math.trunc(offset));
  if (safeLimit === 0) return null;
  return { from: safeOffset, to: safeOffset + safeLimit - 1 };
}
