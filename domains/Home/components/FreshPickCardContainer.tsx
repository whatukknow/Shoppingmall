import { FreshPickCard } from './FreshPickCard';

const freshPicks = [
  {
    title: '한 줌의 초록',
    tags: ['와플', '브런치', '주말아침'],
  },
  {
    title: '토마토가 맛있는 한 끼',
    tags: ['산뜻한맛', '원디쉬'],
  },
  {
    title: '조금씩 담는 채소',
    tags: ['브런치', '고소한맛'],
  },
];

export function FreshPickCardContainer() {
  return (
    <section
      aria-label="신선한 재료"
      className="mx-auto mt-10 w-full max-w-[1080px] px-4"
    >
      <p className="text-foreground font-heading mb-4 text-[14px] font-bold">
        01 / FRESH PICKS
      </p>

      <div className="grid grid-cols-3 gap-6">
        {freshPicks.map((item) => (
          <FreshPickCard key={item.title} title={item.title} tags={item.tags} />
        ))}
      </div>
    </section>
  );
}
