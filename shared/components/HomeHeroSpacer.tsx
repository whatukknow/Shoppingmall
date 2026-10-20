'use client';

import { usePathname } from 'next/navigation';

/** 홈이 아닌 페이지에서 메인 영상 히어로와 같은 높이의 배경 영역을 유지합니다. */
export function HomeHeroSpacer() {
  const pathname = usePathname();

  if (
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/')
  )
    return null;

  return (
    <div
      aria-hidden="true"
      className="min-h-[min(736px,100svh)] w-full"
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
    />
  );
}
