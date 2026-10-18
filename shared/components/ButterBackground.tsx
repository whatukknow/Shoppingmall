import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

export type ButterBackgroundProps = ComponentProps<'div'>;

export function ButterBackground({ className, ...props }: ButterBackgroundProps) {
  return (
    <div
      className={cn('min-h-full flex-1 butter-background', className)}
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
      {...props}
    />
  );
}
