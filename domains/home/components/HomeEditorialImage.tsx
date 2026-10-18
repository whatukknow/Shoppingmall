import Image from 'next/image';

export function HomeEditorialImage({
  src,
  alt,
  sizes = '(max-width: 768px) 100vw, 344px',
}: {
  src: string;
  alt: string;
  sizes?: string;
}) {
  return (
    <Image
      src={src}
      alt={alt}
      width={900}
      height={700}
      sizes={sizes}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.02]"
    />
  );
}
