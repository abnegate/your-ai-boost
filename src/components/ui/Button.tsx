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
    'bg-[var(--color-paper)] text-[var(--color-canvas)] hover:bg-white border border-[var(--color-paper)]',
  secondary:
    'bg-transparent text-[var(--color-text)] hover:bg-[var(--color-surface-2)] border border-[var(--color-border-strong)]',
  ghost:
    'bg-transparent text-[var(--color-muted)] hover:text-[var(--color-paper)] border border-transparent',
  danger:
    'bg-transparent text-[var(--color-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger)_15%,transparent)] border border-[var(--color-danger)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-8 px-3 text-[12px] gap-1.5',
  md: 'h-10 px-4 text-[13px] gap-2',
  lg: 'h-12 px-5 text-[14px] gap-2.5',
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
        'inline-flex items-center justify-center font-medium select-none transition-colors duration-150',
        'rounded-[var(--radius-sm)] disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap',
        'tracking-tight',
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
