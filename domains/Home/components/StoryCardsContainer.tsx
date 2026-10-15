const stories = [
  { title: '오늘의 식탁', description: '계절의 맛을 천천히 즐기는 방법' },
  { title: '작은 발견', description: '매일을 특별하게 만드는 식재료 이야기' },
  { title: '함께 나누기', description: '필요한 만큼 나누어 담는 즐거움' },
];

export function StoryCardsContainer() {
  return (
    <section
      aria-labelledby="home-stories-heading"
      className="mx-auto mt-16 grid w-full max-w-[1080px] gap-4 px-4 sm:grid-cols-3"
    >
      <h2 id="home-stories-heading" className="sr-only">
        오늘의 식탁 이야기
      </h2>
      {stories.map((story) => (
        <article key={story.title} className="bg-card p-6">
          <h3 className="text-lg font-bold">{story.title}</h3>
          <p className="mt-2 text-sm">{story.description}</p>
        </article>
      ))}
    </section>
  );
}
