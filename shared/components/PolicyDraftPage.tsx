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
        This is a bootcamp prototype page. Final policy text has not been added
        yet.
      </p>
    </main>
  );
}
