'use client';

import Link from 'next/link';
import { Button } from '@/shared/components';
import { MyPageNav } from './MyPageNav';
import { cn } from '@/shared/utils/cn';
import type { User } from '../users.types';

type ProfileViewProps = {
  member: User;
  myPodsHref?: string; // 내 신청 팟 목록 주소 (상돈님 화면, 정해지면 전달)
  tasteHref?: string; // AI 추천 취향 주소 (서인님 화면, 정해지면 전달)
  onLogout: () => void;
  isPending?: boolean; // 로그아웃 대기 중 (버튼 비활성화)
};

// 이동 버튼 하나 (이 파일 안에서만 씀)
// 주소가 있으면 링크로, 아직 없으면 "준비 중" 비활성 버튼으로 보여줌
type ActionLinkProps = {
  label: string;
  href?: string;
  primary?: boolean; // 진한 색 버튼인지
};

function ActionLink({ label, href, primary = false }: ActionLinkProps) {
  const style = cn(
    'flex min-h-12 w-full items-center justify-center border px-4 text-sm font-medium',
    primary
      ? 'bg-primary text-primary-foreground border-primary hover:bg-primary/80'
      : 'border-primary text-primary hover:bg-primary/5',
  );

  if (!href) {
    return (
      <span
        aria-disabled="true"
        className={cn(style, 'cursor-not-allowed opacity-50')}
      >
        {label} (Coming soon)
      </span>
    );
  }
  return (
    <Link href={href} className={style}>
      {label}
    </Link>
  );
}

// 회원 정보 화면: 사이드 메뉴(PC) + 기본 정보 + 내 장보기
// 'use client' 없음. 받은 값대로 그리기만 함
export function ProfileView({
  member,
  myPodsHref: myPotsHref,
  tasteHref,
  onLogout,
  isPending = false,
}: ProfileViewProps) {
  const deliveryInfo =
    member.recipientName && member.recipientAddress
      ? `${member.recipientName} · ${member.recipientPhone} · (${member.postalCode}) ${member.recipientAddress} ${member.recipientAddressDetail}`
      : undefined;
  const infoRows = [
    { label: 'Name', value: member.name },
    { label: 'Email', value: member.email },
    {
      label: 'Delivery details',
      value: deliveryInfo ?? 'No delivery details saved yet.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* 제목 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold md:text-[32px]">
          Hello, {member.name}
        </h1>
        <p className="text-base">View your details and buying groups.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr_260px]">
        {/* 왼쪽 사이드 메뉴 (PC에서만) */}
        <MyPageNav
          name={member.name}
          active="profile"
          myPodsHref={myPotsHref}
          tasteHref={tasteHref}
        />

        {/* 가운데 기본 정보 */}
        <section className="border-foreground/20 flex flex-col gap-4 border p-6">
          <h2 className="text-lg font-bold">Account details</h2>
          <dl className="flex flex-col gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-sm">{row.label}</dt>
                <dd className="text-base">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground text-sm">
            Profile editing is coming soon.
          </p>
        </section>

        {/* 오른쪽 내 장보기 */}
        <section className="border-foreground/20 flex flex-col gap-3 border p-6">
          <h2 className="text-lg font-bold">My shopping</h2>
          <ActionLink label="My buying groups" href={myPotsHref} primary />
          <ActionLink label="Taste preferences" href={tasteHref} />
          <Button
            type="button"
            variant="actionOutline"
            size="touch"
            className="w-full"
            onClick={onLogout}
            disabled={isPending}
            aria-busy={isPending}
          >
            {isPending ? 'Logging out…' : 'Log out'}
          </Button>
        </section>
      </div>
    </div>
  );
}
