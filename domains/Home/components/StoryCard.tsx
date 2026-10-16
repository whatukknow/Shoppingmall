type StoryCardProps = {
  title: string;
  description: string;
};

export function StoryCard({ title, description }: StoryCardProps) {
  return (
    <article className="text-foreground flex w-full flex-col gap-2 font-sans">
      <h3 className="text-[20px] leading-[1.45] font-bold">{title}</h3>
      <p className="text-[14px] leading-[1.45]">{description}</p>
    </article>
  );
}
