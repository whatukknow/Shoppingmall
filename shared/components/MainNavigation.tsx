export function MainNavigation() {
  return (
    <nav aria-label="주요 메뉴" className="mx-auto w-full max-w-[1080px] px-4">
      <ul className="text-foreground flex items-center justify-center gap-[180px] font-sans text-[22px] leading-[1.45] font-bold whitespace-nowrap">
        <li>카테고리 ⌄</li>
        <li>많이 찾는 맛</li>
        <li>이번 주 혜택</li>
        <li>나눠 담는 마켓</li>
      </ul>
    </nav>
  );
}
