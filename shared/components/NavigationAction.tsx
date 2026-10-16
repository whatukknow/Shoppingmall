'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/shared/utils/cn';

/** 링크 이동 또는 클릭 동작 중 하나로 메뉴 목적지를 표현합니다. */
export type NavigationTarget =
  { href: string; onClick?: never } | { href?: never; onClick: () => void };

/** 내비게이션 항목의 문구, 대상, 현재 위치와 스타일입니다. */
type NavigationActionProps = {
  label: string;
  target?: NavigationTarget;
  className?: string;
  current?: boolean;
};

/** 링크형 또는 버튼형 메뉴를 만들고 대상이 없으면 비활성화합니다. */
export function NavigationAction({
  label,
  target,
  className,
  current,
}: NavigationActionProps) {
  // 링크와 버튼이 동일한 크기와 포커스 표시를 사용하도록 공통 클래스를 계산합니다.
  const styles = cn(
    'inline-flex min-h-11 min-w-0 items-center justify-center px-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary',
    className,
  );
  if (target?.href) {
    return (
      <Link
        href={target.href}
        aria-current={current ? 'page' : undefined}
        className={styles}
      >
        {label}
      </Link>
    );
  }
  return (
    <Button
      type="button"
      variant="ghost"
      disabled={!target}
      onClick={target?.onClick}
      title={!target ? `${label} 연결 준비 중` : undefined}
      className={styles}
    >
      {label}
    </Button>
  );
}
