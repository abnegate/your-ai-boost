import type { HTMLAttributes } from 'react';
import { cn } from '~/lib/cn';

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  readonly tone?: 'neutral' | 'accent' | 'success' | 'warning';
  readonly dot?: boolean;
};

const toneClasses: Record<NonNullable<BadgeProps['tone']>, string> = {
  neutral: 'text-[var(--color-muted)] border-[var(--color-border-strong)]',
  accent: 'text-[var(--color-accent)] border-[var(--color-accent-soft)]',
  success:
    'text-[var(--color-success)] border-[color-mix(in_oklab,var(--color-success)_40%,transparent)]',
  warning:
    'text-[var(--color-warning)] border-[color-mix(in_oklab,var(--color-warning)_40%,transparent)]',
};

export function Badge({ tone = 'neutral', dot, className, children, ...rest }: BadgeProps) {
  return (
    <span
      {...rest}
      className={cn(
        'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[2px] border',
        'font-mono text-[10px] tracking-[0.2em] uppercase',
        toneClasses[tone],
        className,
      )}
    >
      {dot && <span className="size-1.5 bg-current rotate-45" />}
      {children}
    </span>
  );
}
