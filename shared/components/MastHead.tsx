export function MastHead() {
  return (
    <header
      aria-label="Little Portions"
      className="mx-auto flex w-full max-w-[1080px] flex-col items-center gap-4 px-4 pt-[max(1.25rem,env(safe-area-inset-top))] pb-5"
    >
      <p className="font-heading text-primary text-[128px] leading-[1.06]">
        Little portions
      </p>
      <p className="text-foreground font-sans text-[20px] leading-[1.45] font-bold">
        ISSUE 01 | 느긋하게 차리는, 나의 한 접시
      </p>
    </header>
  );
}
