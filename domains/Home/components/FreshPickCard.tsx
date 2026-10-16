type FreshPickCardProps = {
  title: string;
  tags: string[];
};

export function FreshPickCard({ title, tags }: FreshPickCardProps) {
  return (
    <article className="text-foreground flex w-full flex-col gap-2 font-sans">
      <h3 className="text-[20px] leading-[1.45] font-bold">{title}</h3>

      <p className="flex flex-wrap gap-x-1 text-[14px] leading-[1.45]">
        {tags.map((tag) => (
          <span key={tag}>#{tag}</span>
        ))}
      </p>
    </article>
  );
}
