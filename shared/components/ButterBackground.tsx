import type { ComponentProps } from 'react';
import { cn } from '@/shared/utils/cn';

/** Reusable warm background for page content and shared sections. */
export type ButterBackgroundProps = ComponentProps<'div'>;

/** Applies the shared butter tone while allowing consumers to provide layout classes. */
export function ButterBackground({ className, ...props }: ButterBackgroundProps) {
  return (
    <div
      className={cn('min-h-full flex-1 butter-background', className)}
      style={{ backgroundColor: 'var(--butter, #fff8d6)' }}
      {...props}
    />
  );
}
