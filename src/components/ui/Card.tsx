import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '~/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly padded?: boolean;
};

export function Card({ className, padded = true, ...rest }: CardProps) {
  return <div {...rest} className={cn('surface edge-light', padded && 'p-5', className)} />;
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
      <div className="flex flex-col gap-1 min-w-0">
        <h3 className="text-[14px] font-medium text-[var(--color-text-strong)] tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-[12px] text-[var(--color-muted)] leading-relaxed">{description}</p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
