import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '~/lib/cn';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  readonly padded?: boolean;
};

export function Card({ className, padded = true, ...rest }: CardProps) {
  return <div {...rest} className={cn('panel', padded && 'p-5', className)} />;
}

type CardHeaderProps = {
  readonly title: ReactNode;
  readonly description?: ReactNode;
  readonly actions?: ReactNode;
  readonly className?: string;
};

export function CardHeader({ title, description, actions, className }: CardHeaderProps) {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 mb-4 pb-3 border-b border-dashed border-[var(--color-border)]',
        className,
      )}
    >
      <div className="flex flex-col gap-0.5">
        <h3 className="text-[15px] font-medium text-[var(--color-paper)] tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)] max-w-prose">
            {description}
          </p>
        )}
      </div>
      {actions && <div className="shrink-0">{actions}</div>}
    </div>
  );
}
