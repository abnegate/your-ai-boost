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
        'rounded-[var(--radius-lg)] border p-5 edge-light flex flex-col gap-2',
        accent === 'highlight'
          ? 'bg-[var(--color-surface-2)] border-[var(--color-border-strong)]'
          : 'bg-[var(--color-surface)] border-[var(--color-border)]',
        className,
      )}
    >
      <div className="text-[12px] text-[var(--color-muted)] font-medium tracking-tight">
        {label}
      </div>
      <div
        className={cn(
          'font-semibold tabular-nums tracking-[-0.02em] text-[var(--color-text-strong)]',
          accent === 'highlight' ? 'text-[28px] leading-[1.05]' : 'text-[22px] leading-[1.1]',
        )}
      >
        {value}
      </div>
      {hint && <div className="text-[12px] text-[var(--color-muted)] leading-relaxed">{hint}</div>}
    </div>
  );
}
