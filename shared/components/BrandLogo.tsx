import { cn } from '@/shared/utils/cn';

type BrandLogoProps = {
  className?: string;
};

/** 사이트 전체에서 같은 영문 글꼴과 표기를 사용하는 브랜드 워드마크입니다. */
export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={cn('font-heading font-normal tracking-[-0.035em]', className)}>
      Little Portions
    </span>
  );
}
