import { useMemo } from 'react';

type WeekdayBarsProps = {
  readonly counts: readonly number[];
};

const labels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export function WeekdayBars({ counts }: WeekdayBarsProps) {
  const max = useMemo(() => Math.max(1, ...counts), [counts]);

  return (
    <ul className="flex flex-col gap-2.5">
      {labels.map((label, index) => {
        const value = counts[index] ?? 0;
        const share = value / max;
        return (
          <li key={label} className="grid grid-cols-[40px_1fr_44px] items-center gap-3">
            <span className="text-xs text-[var(--color-muted)] uppercase tracking-wider">
              {label}
            </span>
            <div className="h-2 rounded-full bg-[var(--color-surface-2)] overflow-hidden">
              <div
                className="h-full rounded-full bg-[var(--color-accent)]"
                style={{ width: `${Math.max(2, share * 100)}%` }}
              />
            </div>
            <span className="text-xs text-right text-[var(--color-text)] tabular-nums">
              {value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
