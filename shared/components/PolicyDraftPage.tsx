/** A clearly marked draft page for policy routes without approved legal copy. */
export function PolicyDraftPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <main className="mx-auto w-full max-w-[1440px] flex-1 px-6 py-16">
      <h1 className="text-3xl font-semibold">{title}</h1>
      <p className="text-muted-foreground mt-6 max-w-2xl text-base leading-7">
        {description}
      </p>
      <p className="text-muted-foreground mt-3 text-sm">
        이 화면은 부트캠프 시안용 경로이며, 실제 정책 문구는 아직 반영되지 않았습니다.
      </p>
    </main>
  );
}
