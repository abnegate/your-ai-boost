import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '~/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly padded?: boolean;
};

export function Card({ className, padded = true, ...rest }: CardProps) {
  return (
    <div
      {...rest}
      className={cn(
        'bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--radius-lg)] shadow-[0_1px_0_0_rgba(255,255,255,0.02)_inset]',
        padded && 'p-6',
        className,
      )}
    />
  );
}

type CardHeaderProps = {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
};

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between gap-4 mb-5', className)}>
      <div>
        <h3 className="text-base font-semibold text-[var(--color-text-strong)] tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-sm text-[var(--color-muted)] mt-1 max-w-prose">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
