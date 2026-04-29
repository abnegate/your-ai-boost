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
          <li key={label} className="grid grid-cols-[36px_1fr_42px] items-center gap-3">
            <span className="text-[12px] text-[var(--color-muted-2)] tracking-tight">{label}</span>
            <div className="h-2 bg-[var(--color-bg-elev)] relative overflow-hidden rounded-full border border-[var(--color-border)]">
              <div
                className="absolute left-0 top-0 bottom-0 bg-[var(--color-accent)] rounded-full"
                style={{ width: `${Math.max(2, share * 100)}%` }}
              />
            </div>
            <span className="text-[12px] text-right text-[var(--color-text)] tabular-nums">
              {value}
            </span>
          </li>
        );
      })}
    </ul>
  );
}
