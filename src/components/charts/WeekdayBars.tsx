import { useMemo } from 'react';

type WeekdayBarsProps = {
  readonly counts: readonly number[];
};

const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekdayBars({ counts }: WeekdayBarsProps) {
  const max = useMemo(() => Math.max(1, ...counts), [counts]);

  return (
    <ul className="flex flex-col">
      {labels.map((label, index) => {
        const value = counts[index] ?? 0;
        const share = value / max;
        return (
          <li
            key={label}
            className="grid grid-cols-[40px_1fr_44px] items-center gap-3 py-2 border-b border-dashed border-[var(--color-border)] last:border-b-0"
          >
            <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
              {label}
            </span>
            <div className="h-1.5 bg-[var(--color-surface-2)] relative overflow-hidden rounded-[1px]">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[var(--color-accent)]"
                style={{ width: `${Math.max(2, share * 100)}%` }}
              />
            </div>
            <span className="font-mono text-[11px] text-right text-[var(--color-text)] tabular-nums">
              {value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
