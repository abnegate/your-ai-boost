import type { HTMLAttributes } from 'react';
import { cn } from '~/lib/cn';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: 'neutral' | 'accent' | 'success' | 'warning';
  readonly dot?: boolean;
};

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'bg-[var(--color-surface-2)] text-[var(--color-text)] border-[var(--color-border)]',
  accent:
    'bg-[color-mix(in_oklab,var(--color-accent)_18%,transparent)] text-[var(--color-accent)] border-[color-mix(in_oklab,var(--color-accent)_45%,transparent)]',
  success:
    'bg-[color-mix(in_oklab,var(--color-success)_18%,transparent)] text-[var(--color-success)] border-[color-mix(in_oklab,var(--color-success)_40%,transparent)]',
  warning:
    'bg-[color-mix(in_oklab,var(--color-warning)_18%,transparent)] text-[var(--color-warning)] border-[color-mix(in_oklab,var(--color-warning)_40%,transparent)]',
};

export function Badge({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 rounded-full bg-current" />}
      {children}
    </span>
  );
}
