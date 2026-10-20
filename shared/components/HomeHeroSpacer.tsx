'use client';

import { usePathname } from 'next/navigation';
import Image from 'next/image';

/** 홈이 아닌 페이지에서 메인 영상 히어로와 같은 높이의 배경 영역을 유지합니다. */
export function HomeHeroSpacer() {
  const pathname = usePathname();

  if (
    pathname === '/' ||
    pathname === '/onboarding' ||
    pathname.startsWith('/onboarding/')
  )
    return null;

  if (pathname === '/about') {
    return (
      <div className="h-[min(736px,100svh)] w-full bg-background px-6 py-8">
        <div className="relative h-full w-full">
          <Image
            src="/images/brand-story/no-more-waste.png"
            alt="NO MORE WASTE 표지판 뒤에서 두 팔을 든 보라색 옷의 남자"
            fill
            priority
            sizes="100vw"
            className="object-contain"
          />
        </div>
      </div>
    );
  }

  return (
    <div
      aria-hidden="true"
      className="min-h-[min(736px,100svh)] w-full"
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
    />
  );
}
