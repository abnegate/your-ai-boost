import type { ReactNode } from 'react';

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="panel crosshairs relative px-6 py-16 text-center">
      <span className="ch-tr" />
      <span className="ch-br" />
      <div className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-muted)] mb-4">
        ◇ Nothing to plot
      </div>
      <h2 className="display italic text-[36px] text-[var(--color-paper)] leading-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[14px] text-[var(--color-text)] mt-3 max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-6 flex justify-center">{action}</div>}
    </div>
  );
}
