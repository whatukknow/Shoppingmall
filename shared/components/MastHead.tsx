'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MainNavigation, type MainNavigationProps } from './MainNavigation';
import { BrandLogo } from './BrandLogo';
import { NavigationAction, type NavigationTarget } from './NavigationAction';

/** 브랜드 표시 또는 상단 헤더, 계정 동작, 메뉴 설정입니다. */
export type MastHeadProps = {
  variant?: 'brand' | 'header';
  user?: { name: string } | null;
  login?: NavigationTarget;
  account?: NavigationTarget;
  navigation?: MainNavigationProps;
};

/** 브랜드형 헤더와 내비게이션이 포함된 상단 헤더를 제공합니다. */
export function MastHead({
  variant = 'brand',
  user = null,
  login,
  account,
  navigation,
}: MastHeadProps) {
  const pathname = usePathname();
  const isHome = pathname === '/';
  const router = useRouter();

  // 로그인 버튼: 지금 보던 주소를 next로 넘겨서 로그인 후 돌아오게 함
  const loginTarget: NavigationTarget = login ?? {
    onClick: () => {
      if (pathname === '/login') return; // 로그인 페이지에서는 그대로
      if (pathname === '/signup') {
        router.push(`/login${window.location.search}`); // 회원가입 화면이면 원래 next 그대로 들고 감
        return;
      }
      const current = window.location.pathname + window.location.search;
      router.push(`/login?next=${encodeURIComponent(current)}`);
    },
  };

  if (variant === 'brand') {
    return (
      <div
        aria-label="Little Portions"
        className="text-foreground mx-auto flex w-full max-w-[1440px] flex-col items-center gap-4 px-4 py-10 text-center"
      >
        <BrandLogo className="text-primary text-[clamp(2rem,8vw,5rem)] leading-[1.1]" />
        <p className="text-base leading-6">
          필요한 만큼, 함께 나누는 신선함
        </p>
      </div>
    );
  }
  return (
    <header
      aria-label="상점 헤더"
      className={isHome
        ? 'absolute top-0 left-0 z-40 w-full pt-[env(safe-area-inset-top)] text-white'
        : 'bg-background/95 text-foreground border-foreground/15 sticky top-0 z-40 w-full border-b pt-[env(safe-area-inset-top)] backdrop-blur-sm'}
    >
      <div className="mx-auto flex min-h-14 w-full max-w-[1440px] flex-wrap items-center gap-x-2 gap-y-1 px-3 py-1 sm:min-h-20 sm:flex-nowrap sm:gap-6 sm:px-6 lg:px-12">
        <Link
          href="/"
          aria-label="Little Portions 홈"
          className="focus-visible:outline-primary min-w-0 text-base focus-visible:outline-2 sm:text-[22px]"
        >
          <BrandLogo />
        </Link>
        <MainNavigation
          {...navigation}
          className={`order-3 w-full flex-none px-0 py-0 sm:order-none sm:w-auto sm:flex-1 ${isHome ? 'text-white' : ''}`}
        />
        <div className="ml-auto flex min-w-0 items-center gap-1 sm:gap-4">
          <NavigationAction
            label={user ? `${user.name}님` : '로그인'}
            target={user ? account : loginTarget}
            className="max-w-36 truncate"
          />
          <NavigationAction label="함께 나누기" target={{ href: '/#how-it-works' }} />
        </div>
      </div>
    </header>
  );
}
