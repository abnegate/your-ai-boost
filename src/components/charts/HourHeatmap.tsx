import { useMemo } from 'react';

type HourHeatmapProps = {
  readonly hours: readonly number[];
};

const hourLabels = ['00', '06', '12', '18'];

export function HourHeatmap({ hours }: HourHeatmapProps) {
  const max = useMemo(() => Math.max(1, ...hours), [hours]);

  return (
    <div className="flex flex-col gap-2">
      <div className="grid gap-[3px]" style={{ gridTemplateColumns: 'repeat(24, minmax(0, 1fr))' }}>
        {hours.map((value, index) => {
          const intensity = value / max;
          const filled = intensity > 0;
          return (
            <div
              key={index}
              title={`${index}:00 — ${value} commits`}
              className="h-10 rounded-[2px]"
              style={{
                background: filled
                  ? `color-mix(in oklab, var(--color-accent) ${Math.round(20 + intensity * 80)}%, var(--color-surface))`
                  : 'transparent',
                outline: filled ? 'none' : '1px solid var(--color-border)',
                outlineOffset: '-1px',
              }}
            />
          );
        })}
      </div>
      <div
        className="grid font-mono text-[10px] tracking-[0.18em] text-[var(--color-muted)] tabular-nums"
        style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}
      >
        {hourLabels.map((label) => (
          <span key={label}>{label}h</span>
        ))}
      </div>
    </div>
  );
}
