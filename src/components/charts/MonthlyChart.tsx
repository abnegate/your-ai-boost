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

const tickStyle = { fill: 'var(--color-muted)', fontSize: 11 } as const;

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
          <defs>
            <linearGradient id="commitsFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-accent)" stopOpacity={0.45} />
              <stop offset="100%" stopColor="var(--color-accent)" stopOpacity={0.02} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
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
            cursor={{ stroke: 'var(--color-border-strong)', strokeWidth: 1 }}
            contentStyle={{
              background: 'var(--color-surface-2)',
              border: '1px solid var(--color-border-strong)',
              borderRadius: 12,
              color: 'var(--color-text)',
              fontSize: 12,
            }}
            labelStyle={{ color: 'var(--color-text-strong)', fontWeight: 600 }}
            formatter={(value, name) => [formatNumber(Number(value ?? 0)), name]}
          />
          {referenceLabel && (
            <ReferenceLine
              x={referenceLabel}
              stroke="var(--color-accent)"
              strokeDasharray="4 4"
              label={{
                value: 'AI start',
                fill: 'var(--color-accent)',
                position: 'insideTopRight',
                fontSize: 11,
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="commits"
            name="All commits"
            stroke="var(--color-accent)"
            strokeWidth={2}
            fill="url(#commitsFill)"
          />
          <Line
            type="monotone"
            dataKey="aiCommits"
            name="AI commits"
            stroke="var(--color-success)"
            strokeWidth={2}
            dot={false}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
