import Link from 'next/link';

/** 취향 데이터가 없는 로그인 사용자에게 취향 찾기를 유도하는 카드입니다. */
export function TasteFinderPromptCard() {
  return (
    <div className="flex min-h-48 flex-col items-center justify-center gap-6 text-center">
      <p className="text-[26px] leading-tight font-bold sm:text-[30px]">
        Explore your food fortune
        <br />
        and discover your next meal
      </p>
      <Link
        href="/onboarding"
        className="inline-flex items-center justify-center rounded-none bg-[#650f20] px-6 py-3 text-[13px] font-medium text-white hover:opacity-90"
      >
        Find your taste
      </Link>
    </div>
  );
}
