import Link from 'next/link';
import { Button } from './ui/button';
import { StatusBadge, type ApplicationStatus } from './StatusBadge';

/** Display data for a pot; status and counts must come from the owning feature. */
export type PotCardProps = {
  title: string;
  cropName: string;
  description?: string;
  status: ApplicationStatus;
  applicantCount: number;
  capacity: number;
  href?: string;
  actionLabel?: string;
  onAction?: () => void;
  actionDisabled?: boolean;
};

/** Displays pot details and externally supplied application state without calculating eligibility. */
export function PotCard({
  title,
  cropName,
  description,
  status,
  applicantCount,
  capacity,
  href,
  actionLabel,
  onAction,
  actionDisabled = false,
}: PotCardProps) {
  return (
    <article className="border-border flex min-w-0 flex-col gap-4 border p-5" aria-label={`${title} 소분 팟`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-muted-foreground text-sm">{cropName}</p>
          <h3 className="mt-1 font-semibold">{href ? <Link href={href}>{title}</Link> : title}</h3>
        </div>
        <StatusBadge status={status} />
      </div>
      {description && <p className="text-muted-foreground text-sm">{description}</p>}
      <p className="text-sm">신청 현황 <strong>{applicantCount} / {capacity}명</strong></p>
      {actionLabel && onAction && (
        <Button type="button" size="touch" disabled={actionDisabled} onClick={onAction}>{actionLabel}</Button>
      )}
    </article>
  );
}
