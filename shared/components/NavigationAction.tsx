'use client';

import Link from 'next/link';
import { Button } from './ui/button';
import { cn } from '@/shared/utils/cn';

export type NavigationTarget =
  { href: string; onClick?: never } | { href?: never; onClick: () => void };

type NavigationActionProps = {
  label: string;
  target?: NavigationTarget;
  className?: string;
  current?: boolean;
};

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
      title={!target ? `${label} coming soon` : undefined}
      className={styles}
    >
      {label}
    </Button>
  );
}
