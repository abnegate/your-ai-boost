import type { HTMLAttributes } from 'react';
import { cn } from '~/lib/cn';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: 'neutral' | 'accent' | 'success' | 'warning';
  readonly dot?: boolean;
};

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral:
    'text-[var(--color-muted-2)] bg-[var(--color-surface)] border-[var(--color-border-strong)]',
  accent:
    'text-[var(--color-accent-hover)] bg-[var(--color-accent-soft)] border-[color-mix(in_oklab,var(--color-accent)_30%,transparent)]',
  success:
    'text-[var(--color-success)] bg-[color-mix(in_oklab,var(--color-success)_10%,transparent)] border-[color-mix(in_oklab,var(--color-success)_28%,transparent)]',
  warning:
    'text-[var(--color-warning)] bg-[color-mix(in_oklab,var(--color-warning)_10%,transparent)] border-[color-mix(in_oklab,var(--color-warning)_28%,transparent)]',
};

export function Badge({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 h-[22px] rounded-[var(--radius-xs)] border',
        'text-[11px] font-medium tracking-tight',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
