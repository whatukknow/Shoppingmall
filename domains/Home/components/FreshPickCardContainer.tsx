const freshPicks = [
  { title: '제철의 향기', description: '지금 가장 맛있는 계절의 재료' },
  { title: '한 끼의 여유', description: '오늘을 위한 산뜻한 한 접시' },
  { title: '작은 즐거움', description: '식탁에 더하는 새로운 맛' },
];

export function FreshPickCardContainer() {
  return (
    <section
      aria-labelledby="fresh-picks-heading"
      className="mx-auto mt-16 w-full max-w-[1080px] px-4"
    >
      <h2 id="fresh-picks-heading" className="mb-6 text-2xl font-bold">
        Fresh Picks
      </h2>
      <div className="grid gap-4 sm:grid-cols-3">
        {freshPicks.map((pick) => (
          <article key={pick.title} className="bg-card min-h-48 p-6">
            <h3 className="text-lg font-bold">{pick.title}</h3>
            <p className="mt-2 text-sm">{pick.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
