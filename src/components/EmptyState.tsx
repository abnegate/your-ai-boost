import type { ReactNode } from 'react';

type EmptyStateProps = {
  readonly title: string;
  readonly description?: string;
  readonly action?: ReactNode;
};

export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div className="surface edge-light px-6 py-14 text-center flex flex-col items-center gap-3">
      <div className="size-10 rounded-full bg-[var(--color-surface-2)] border border-[var(--color-border)] grid place-items-center mb-2">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
          <circle cx="8" cy="8" r="6" stroke="var(--color-muted)" strokeWidth="1.4" />
          <path
            d="M5.5 8.5h5"
            stroke="var(--color-muted)"
            strokeWidth="1.4"
            strokeLinecap="round"
          />
        </svg>
      </div>
      <h2 className="text-[18px] font-semibold text-[var(--color-text-strong)] tracking-tight">
        {title}
      </h2>
      {description && (
        <p className="text-[13px] text-[var(--color-muted-2)] max-w-md mx-auto leading-relaxed">
          {description}
        </p>
      )}
      {action && <div className="mt-3 flex justify-center">{action}</div>}
    </div>
  );
}
