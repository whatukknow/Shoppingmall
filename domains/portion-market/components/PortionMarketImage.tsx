import Image from 'next/image';
import { cn } from '@/shared/utils/cn';

type PortionMarketImageProps = {
  src?: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  className?: string;
};

// 소분마켓에서 쓰는 사진 칸. 사진이 없으면 빈 칸(bg-card)만 보임
export function PortionMarketImage({
  src,
  alt,
  sizes,
  priority,
  className,
}: PortionMarketImageProps) {
  return (
    <div className={cn('bg-card relative overflow-hidden', className)}>
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-cover"
        />
      )}
    </div>
  );
}
