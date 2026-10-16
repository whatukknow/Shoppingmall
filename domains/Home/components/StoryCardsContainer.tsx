import { StoryCard } from './StoryCard';

const storyCards = [
  {
    title: '우리 집이 좋아하는 카페.',
    description: '빵과 달걀을 곁들여, 느긋하게 차리는 한 접시.',
  },
  {
    title: '오늘은, 파스타가 있는 식탁.',
    description: '따뜻한 파스타부터 산뜻한 한 접시까지.',
  },
  {
    title: '들고, 한강으로.',
    description: '샌드위치 하나 챙겨, 강바람이 있는 자리로.',
  },
];

export function StoryCardsContainer() {
  return (
    <section
      aria-labelledby="home-stories-title"
      className="mx-auto mt-20 w-full max-w-[1080px] px-4"
    >
      <div className="mb-8 flex items-start justify-between gap-4">
        <div>
          <h2
            id="home-stories-title"
            className="text-primary text-[30px] leading-[1.4] font-bold"
          >
            오늘의 식탁, 어디로 떠나볼까요?
          </h2>
          <p className="text-foreground mt-3 text-[16px] leading-[1.5]">
            집에서 즐기는 카페 한 접시부터, 한강으로 들고 나가는 샌드위치까지.
          </p>
        </div>
        <span className="text-primary shrink-0 text-[20px] font-bold">
          더보기&gt;
        </span>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {storyCards.map((story) => (
          <StoryCard
            key={story.title}
            title={story.title}
            description={story.description}
          />
        ))}
      </div>
    </section>
  );
}
