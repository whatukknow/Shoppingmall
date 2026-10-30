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
    { label: 'Market', target: products },
    {
      label: 'Find your taste',
      target: recommendation ?? { href: '/onboarding' },
    },
    { label: 'Our story', target: about ?? { href: '/about' } },
  ];
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        'text-foreground mx-auto w-full max-w-[1440px] px-2 py-2 sm:px-4 sm:py-3',
        className,
      )}
    >
      <ul className="grid grid-cols-3 gap-2 text-center sm:flex sm:gap-[58px]">
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
