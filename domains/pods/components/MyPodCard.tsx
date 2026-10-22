import Link from 'next/link';
import { cn } from '@/shared/utils/cn';
import type { MyPodApplication } from '../../auth/users.types';
import { getMyPodView, type MyPodAction } from '../data/myPods';
import MyPodCancelContainer from '../containers/MyPodCancelContainer';

type MyPodCardProps = {
  application: MyPodApplication;
};

// ProfileView 의 ActionLink 와 같은 클래스를 쓰는 작은 링크 버튼
type CardActionLinkProps = {
  label: string;
  href: string;
  primary?: boolean;
};

function CardActionLink({ label, href, primary = false }: CardActionLinkProps) {
  return (
    <Link
      href={href}
      className={cn(
        'flex min-h-12 w-full items-center justify-center border px-4 text-sm font-medium',
        primary
          ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/80'
          : 'border-primary text-primary hover:bg-primary/5',
      )}
    >
      {label}
    </Link>
  );
}

type ActionItemProps = {
  action: MyPodAction;
  podId: string;
};

function ActionItem({ action, podId }: ActionItemProps) {
  if (action.cancel) {
    // 취소는 링크가 아니라 API 호출 — 취소 컨테이너 사용
    return <MyPodCancelContainer podId={podId} label={action.label} />;
  }
  return (
    <CardActionLink
      label={action.label}
      href={action.href ?? '#'}
      primary={action.primary}
    />
  );
}

// 내 신청 팟 카드 한 장 — ProfileView 섹션 상자 스타일(border p-6)의 가로 배치
export function MyPodCard({ application }: MyPodCardProps) {
  const view = getMyPodView(application);
  const price = application.unitPrice.toLocaleString('ko-KR');

  return (
    <article className="border-foreground/20 flex flex-col gap-4 border p-6 md:flex-row md:items-center">
      {/* 왼쪽 이미지 (88~120px) */}
      <div className="relative h-[88px] w-[88px] shrink-0 self-start overflow-hidden md:h-[120px] md:w-[120px]">
        {application.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element -- 목업 이미지 경로 (next/image 비율 제한 회피)
          <img
            src={application.imageUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        ) : (
          <div className="bg-primary/5 text-foreground/50 flex size-full items-center justify-center text-sm">
            이미지 준비 중
          </div>
        )}
      </div>

      {/* 가운데 정보 */}
      <div className="flex min-w-0 flex-1 flex-col gap-1">
        <h3 className="text-lg font-bold">
          {application.productName} · {application.optionLabel}
        </h3>
        <p className="text-sm">{view.statusLabel}</p>
        <p className="text-muted-foreground text-sm">
          {application.optionLabel} · {application.quantity}개 · {price}원
        </p>
      </div>

      {/* 오른쪽 버튼 열 */}
      <div className="flex w-full flex-col gap-3 md:w-64">
        {view.actions.map((action) => (
          <ActionItem
            key={action.label}
            action={action}
            podId={application.podId}
          />
        ))}
      </div>
    </article>
  );
}
