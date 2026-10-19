import { cn } from '@/shared/utils/cn';

type BrandLogoProps = {
  className?: string;
};

export function BrandLogo({ className }: BrandLogoProps) {
  return (
    <span className={cn('font-heading font-normal tracking-[-0.035em]', className)}>
      Little Portions
    </span>
  );
}
