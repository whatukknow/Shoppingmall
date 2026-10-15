'use client';
import { usePathname } from 'next/navigation';
export function MastHead() {
  const pathName = usePathname();
  const isMain = pathName === '/';
  return (
    <header
      aria-label="Little Portions"
      className="m-10 mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5"
    >
      <p
        className={`font-heading text-primary leading-[1.06] ${
          isMain ? 'text-[128px]' : 'text-[24px]'
        }`}
      >
        Little portions
      </p>
      <p className="text-foreground font-sans text-[20px] leading-[1.45] font-bold">
        ISSUE 01 | 느긋하게 차리는, 나의 한 접시
      </p>
      <p className="px-8"></p>
    </header>
  );
}
