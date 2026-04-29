import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '~/lib/cn';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  readonly variant?: Variant;
  readonly size?: Size;
  readonly leading?: ReactNode;
  readonly trailing?: ReactNode;
};

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-[var(--color-accent)] text-[var(--color-text-strong)] hover:bg-[#7aa2ff] active:bg-[#4f7ee6] disabled:bg-[var(--color-accent-soft)] disabled:text-[var(--color-muted)]',
  secondary:
    'bg-[var(--color-surface-2)] text-[var(--color-text)] hover:bg-[var(--color-surface-3)] border border-[var(--color-border-strong)]',
  ghost:
    'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border border-transparent hover:border-[var(--color-border)]',
  danger:
    'bg-[var(--color-danger)] text-[var(--color-text-strong)] hover:bg-[#ff8298] active:bg-[#e9596f]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-sm rounded-[var(--radius-sm)] gap-1.5',
  md: 'h-10 px-4 text-sm rounded-[var(--radius-md)] gap-2',
  lg: 'h-12 px-6 text-base rounded-[var(--radius-md)] gap-2.5',
};

export function Button({
  variant = 'primary',
  size = 'md',
  leading,
  trailing,
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={cn(
        'inline-flex items-center justify-center font-medium select-none transition-colors duration-150 disabled:opacity-60 disabled:cursor-not-allowed whitespace-nowrap',
        variantClasses[variant],
        sizeClasses[size],
        className,
      )}
    >
      {leading}
      {children}
      {trailing}
    </button>
  );
}
