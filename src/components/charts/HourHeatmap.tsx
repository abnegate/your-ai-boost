import { useMemo } from 'react';

type HourHeatmapProps = {
  readonly hours: readonly number[];
};

const hourLabels = ['12a', '6a', '12p', '6p'];

export function HourHeatmap({ hours }: HourHeatmapProps) {
  const max = useMemo(() => Math.max(1, ...hours), [hours]);

  return (
    <div className="flex flex-col gap-2">
      <div
        className="grid grid-cols-24 gap-[3px]"
        style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}
      >
        {hours.map((value, index) => {
          const intensity = value / max;
          return (
            <div
              key={index}
              title={`${index}:00 — ${value} commits`}
              className="h-9 rounded-[6px] border border-[var(--color-border)]"
              style={{
                background:
                  intensity === 0
                    ? 'var(--color-surface-2)'
                    : `color-mix(in oklab, var(--color-accent) ${Math.round(20 + intensity * 70)}%, var(--color-surface))`,
              }}
            />
          );
        })}
      </div>
      <div className="flex justify-between text-[10px] text-[var(--color-muted)] uppercase tracking-wider">
        {hourLabels.map((label) => (
          <span key={label}>{label}</span>
        ))}
        <span>12a</span>
      </div>
    </div>
  );
}
