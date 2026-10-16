import type { ReactNode } from 'react';
import { Button } from './ui/button';

/** Optional action and content for a reusable no-content or status message. */
export type EmptyStateProps = {
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
};

/** Provides a consistent, accessible message for empty, waiting, or completed sections. */
export function EmptyState({ title, description, actionLabel, onAction, children }: EmptyStateProps) {
  return (
    <section className="flex min-h-48 flex-col items-center justify-center gap-3 px-6 py-10 text-center" aria-label={title}>
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-muted-foreground max-w-prose text-sm">{description}</p>}
      {children}
      {actionLabel && onAction && <Button type="button" size="touch" onClick={onAction}>{actionLabel}</Button>}
    </section>
  );
}
