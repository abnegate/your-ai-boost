import type { ReactNode } from 'react';
import { cn } from '~/lib/cn';

type StatProps = {
  readonly label: ReactNode;
  readonly value: ReactNode;
  readonly hint?: ReactNode;
  readonly accent?: 'default' | 'highlight';
  readonly className?: string;
};

export function Stat({ label, value, hint, accent = 'default', className }: StatProps) {
  return (
    <div
      className={cn(
        'rounded-[var(--radius-lg)] border p-5',
        accent === 'highlight'
          ? 'bg-[var(--color-surface-3)] border-[var(--color-border-strong)]'
          : 'bg-[var(--color-surface)] border-[var(--color-border)]',
        className,
      )}
    >
      <div className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)] font-medium">
        {label}
      </div>
      <div
        className={cn(
          'mt-2 font-semibold tabular-nums tracking-tight',
          accent === 'highlight'
            ? 'text-3xl text-[var(--color-text-strong)]'
            : 'text-2xl text-[var(--color-text-strong)]',
        )}
      >
        {value}
      </div>
      {hint && <div className="text-xs text-[var(--color-muted)] mt-2">{hint}</div>}
    </div>
  );
}
