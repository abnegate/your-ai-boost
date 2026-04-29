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
  fontSize: 11,
  fontFamily: 'var(--font-sans)',
} as const;

export function MonthlyChart({ months, firstAiMonth }: MonthlyChartProps) {
  const data = useMemo<ChartDatum[]>(
    () =>
      months.map((m) => ({
        yearMonth: m.yearMonth,
        label: formatMonth(m.yearMonth),
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
          <CartesianGrid stroke="var(--color-divider)" strokeDasharray="2 4" vertical={false} />
          <XAxis
            dataKey="label"
            tick={tickStyle}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
            interval="preserveStartEnd"
            minTickGap={24}
          />
          <YAxis tick={tickStyle} tickLine={false} axisLine={false} width={40} />
          <Tooltip
            cursor={{ stroke: 'var(--color-accent)', strokeWidth: 1, strokeDasharray: '2 2' }}
            contentStyle={{
              background: 'var(--color-bg-elev)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 8,
              color: 'var(--color-text-strong)',
              fontSize: 12,
              fontFamily: 'var(--font-sans)',
              padding: '8px 10px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
            }}
            labelStyle={{
              color: 'var(--color-muted-2)',
              fontWeight: 500,
              fontSize: 11,
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
                value: 'first AI commit',
                fill: 'var(--color-accent)',
                position: 'insideTopRight',
                fontSize: 10,
                fontFamily: 'var(--font-sans)',
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="commits"
            name="all commits"
            stroke="var(--color-text)"
            strokeWidth={1.5}
            fill="var(--color-surface-3)"
            fillOpacity={0.5}
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
