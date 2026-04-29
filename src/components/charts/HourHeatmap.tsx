import { useMemo } from 'react';

type HourHeatmapProps = {
  readonly hours: readonly number[];
};

const hourLabels = ['00', '06', '12', '18'];

export function HourHeatmap({ hours }: HourHeatmapProps) {
  const max = useMemo(() => Math.max(1, ...hours), [hours]);

  return (
    <div className="flex flex-col gap-2.5">
      <div className="grid gap-[4px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {hours.map((value, index) => {
          const intensity = value / max;
          const filled = intensity > 0;
          return (
            <div
              key={index}
              title={`${index}:00 — ${value} commits`}
              className="h-11 rounded-[var(--radius-xs)] transition-colors"
              style={{
                background: filled
                  ? `color-mix(in oklab, var(--color-accent) ${Math.round(15 + intensity * 75)}%, var(--color-bg-elev))`
                  : 'var(--color-bg-elev)',
                border: '1px solid var(--color-border)',
              }}
            />
          );
        })}
      </div>
      <div
        className="grid text-[11px] text-[var(--color-muted)] tabular-nums"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {hourLabels.map((label) => (
          <span key={label}>{label}:00</span>
        ))}
      </div>
    </div>
  );
}
