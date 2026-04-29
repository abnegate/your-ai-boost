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
    'bg-[var(--color-accent)] text-white hover:bg-[var(--color-accent-hover)] border border-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.16)]',
  secondary:
    'bg-[var(--color-surface)] text-[var(--color-text-strong)] hover:bg-[var(--color-surface-2)] hover:border-[var(--color-border-strong)] border border-[var(--color-border)]',
  ghost:
    'bg-transparent text-[var(--color-muted-2)] hover:text-[var(--color-text-strong)] hover:bg-[var(--color-surface)] border border-transparent',
  danger:
    'bg-transparent text-[var(--color-danger)] hover:bg-[color-mix(in_oklab,var(--color-danger)_12%,transparent)] border border-[color-mix(in_oklab,var(--color-danger)_50%,transparent)]',
};

const sizeClasses: Record<Size, string> = {
  sm: 'h-7 px-2.5 text-[12px] gap-1.5 rounded-[var(--radius-sm)]',
  md: 'h-9 px-3.5 text-[13px] gap-2 rounded-[var(--radius-md)]',
  lg: 'h-11 px-5 text-[14px] gap-2.5 rounded-[var(--radius-md)]',
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
        'inline-flex items-center justify-center font-medium select-none transition-all duration-150',
        'disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap tracking-tight',
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
