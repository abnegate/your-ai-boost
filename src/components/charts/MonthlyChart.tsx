import { useMemo } from 'react';
import {
  Area,
  CartesianGrid,
  ComposedChart,
  Line,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import type { MonthlyBucket } from '~/domain/types';
import { formatMonth, formatNumber } from '~/lib/format';

type MonthlyChartProps = {
  readonly months: readonly MonthlyBucket[];
  readonly firstAiMonth?: string | null;
};

type ChartDatum = {
  readonly yearMonth: string;
  readonly label: string;
  readonly commits: number;
  readonly aiCommits: number;
};

const tickStyle = {
  fill: 'var(--color-muted)',
  fontSize: 10,
  fontFamily: 'var(--font-mono)',
  letterSpacing: '0.08em',
} as const;

export function MonthlyChart({ months, firstAiMonth }: MonthlyChartProps) {
  const data = useMemo<ChartDatum[]>(
    () =>
      months.map((m) => ({
        yearMonth: m.yearMonth,
        label: formatMonth(m.yearMonth).toUpperCase().replace(' ', "'"),
        commits: m.commits,
        aiCommits: m.aiCommits,
      })),
    [months],
  );

  const referenceLabel = firstAiMonth
    ? data.find((d) => d.yearMonth === firstAiMonth)?.label
    : undefined;

  return (
    <div className="h-72">
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 12, bottom: 0, left: -12 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={48} />
          <Tooltip
            cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1, strokeDasharray: '2 2' }}
            contentStyle={{
              background: 'var(--color-canvas)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 4,
              color: 'var(--color-paper)',
              fontSize: 11,
              fontFamily: 'var(--font-mono)',
              letterSpacing: '0.04em',
              padding: '8px 10px',
            }}
            labelStyle={{
              color: 'var(--color-accent)',
              fontWeight: 500,
              textTransform: 'uppercase',
              letterSpacing: '0.16em',
              fontSize: 10,
              marginBottom: 4,
            }}
            formatter={(value, name) => [formatNumber(Number(value ?? 0)), name]}
          />
          {referenceLabel && (
            <ReferenceLine
              x={referenceLabel}
              stroke="var(--color-accent)"
              strokeDasharray="3 3"
              strokeWidth={1}
              label={{
                value: '◆ patient zero',
                fill: 'var(--color-accent)',
                position: 'insideTopRight',
                fontSize: 10,
                fontFamily: 'var(--font-mono)',
                letterSpacing: '0.16em',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="commits"
            name="all commits"
            stroke="var(--color-paper)"
            strokeWidth={1.5}
            fill="var(--color-surface-3)"
            fillOpacity={0.6}
          />
          <Line
            type="monotone"
            dataKey="aiCommits"
            name="ai commits"
            stroke="var(--color-accent)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
