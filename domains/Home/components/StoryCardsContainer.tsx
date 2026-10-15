const stories = [
  {
    title: '제철 재료로 채운 한 접시',
    description: '익숙한 재료로 새로운 한 접시를 차려보세요.',
  },
  {
    title: '작은 식탁의 즐거움',
    description: '나에게 꼭 맞는 양으로 천천히 즐기는 식사.',
  },
  {
    title: '함께 나누는 장보기',
    description: '필요한 만큼 고르고, 더 가볍게 시작해요.',
  },
];

export function StoryCardsContainer() {
  return (
    <section className="mx-auto mt-16 w-full max-w-[1080px] px-4">
      <h2 className="text-[24px] font-bold">오늘의 식탁, 어디로 떠나볼까요?</h2>
      <ul className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
        {stories.map((story) => (
          <li
            key={story.title}
            className="bg-card flex min-h-48 flex-col justify-end p-6"
          >
            <h3 className="text-[18px] font-bold">{story.title}</h3>
            <p className="mt-2 text-[14px]">{story.description}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
