'use client';

import { usePathname } from 'next/navigation';
import { NavigationAction, type NavigationTarget } from './NavigationAction';
import { cn } from '@/shared/utils/cn';

export type MainNavigationProps = {
  products?: NavigationTarget;
  recommendation?: NavigationTarget;
  about?: NavigationTarget;
  className?: string;
};

export function MainNavigation({
  products = { href: '/products' },
  recommendation,
  about,
  className,
}: MainNavigationProps) {
  const pathname = usePathname();
  // 메뉴 데이터와 NavigationAction 렌더링을 분리해 항목 구성을 한곳에서 관리합니다.
  const items = [
    { label: '소분마켓', target: products },
    { label: '취향 찾기', target: recommendation ?? { href: '/onboarding' } },
    { label: '브랜드 이야기', target: about ?? { href: '/about' } },
  ];
  return (
    <nav
      aria-label="주요 메뉴"
      className={cn(
        'text-foreground mx-auto w-full max-w-[1440px] px-2 py-2 sm:px-4 sm:py-3',
        className,
      )}
    >
      <ul className="grid grid-cols-3 gap-1 text-center sm:gap-4">
        {items.map(({ label, target }) => (
          <li key={label} className="min-w-0">
            <NavigationAction
              label={label}
              target={target}
              current={!!target?.href && pathname === target.href}
              className="w-full px-1 text-xs sm:px-2 sm:text-sm"
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
