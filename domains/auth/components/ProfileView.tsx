'use client';

import Link from 'next/link';
import { Button } from '@/shared/components';
import { cn } from '@/shared/utils/cn';
import type { Member } from '../auth.types';

type ProfileViewProps = {
  member: Member;
  myPodsHref?: string; // 내 신청 팟 목록 주소 (상돈님 화면, 정해지면 전달)
  tasteHref?: string; // AI 추천 취향 주소 (서인님 화면, 정해지면 전달)
  onLogout: () => void;
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
        {label} (준비 중)
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
}: ProfileViewProps) {
  const infoRows = [
    { label: '이름', value: member.name },
    { label: '이메일', value: member.email },
    {
      label: '수령 정보',
      value: member.deliveryInfo ?? '등록된 수령 정보가 없어요.',
    },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* 제목 */}
      <div className="flex flex-col gap-2">
        <h1 className="text-[28px] font-bold md:text-[32px]">
          {member.name}님, 안녕하세요
        </h1>
        <p className="text-base">내 정보와 신청 내역을 확인해요.</p>
      </div>

      <div className="grid gap-8 md:grid-cols-[180px_1fr_260px]">
        {/* 왼쪽 사이드 메뉴 (PC에서만) */}
        <nav
          aria-label="내 정보 메뉴"
          className="hidden flex-col gap-3 md:flex"
        >
          <p className="font-bold">{member.name}님</p>
          <ul className="flex flex-col gap-2 text-sm">
            <li>
              {myPotsHref ? (
                <Link href={myPotsHref} className="hover:underline">
                  내 신청 팟
                </Link>
              ) : (
                <span className="text-muted-foreground">내 신청 팟</span>
              )}
            </li>
            <li>
              <span aria-current="page" className="font-bold">
                ● 회원 정보
              </span>
            </li>
            <li>
              {tasteHref ? (
                <Link href={tasteHref} className="hover:underline">
                  추천 취향
                </Link>
              ) : (
                <span className="text-muted-foreground">추천 취향</span>
              )}
            </li>
          </ul>
        </nav>

        {/* 가운데 기본 정보 */}
        <section className="border-foreground/20 flex flex-col gap-4 border p-6">
          <h2 className="text-lg font-bold">기본 정보</h2>
          <dl className="flex flex-col gap-4">
            {infoRows.map((row) => (
              <div key={row.label} className="flex flex-col gap-1">
                <dt className="text-muted-foreground text-sm">{row.label}</dt>
                <dd className="text-base">{row.value}</dd>
              </div>
            ))}
          </dl>
          <p className="text-muted-foreground text-sm">
            정보 수정은 준비 중이에요.
          </p>
        </section>

        {/* 오른쪽 내 장보기 */}
        <section className="border-foreground/20 flex flex-col gap-3 border p-6">
          <h2 className="text-lg font-bold">내 장보기</h2>
          <ActionLink label="내 신청 팟 목록" href={myPotsHref} primary />
          <ActionLink label="AI 추천 취향 설정" href={tasteHref} />
          <Button
            type="button"
            variant="actionOutline"
            size="touch"
            className="w-full"
            onClick={onLogout}
          >
            로그아웃
          </Button>
        </section>
      </div>
    </div>
  );
}
