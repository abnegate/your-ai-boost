import type { ReactNode } from 'react';
import type { AnalysisResult } from '~/domain/types';
import { Badge } from '~/components/ui/Badge';
import { Card, CardHeader } from '~/components/ui/Card';
import { formatDate, formatMonth, formatNumber, formatPercent } from '~/lib/format';

type InsightsListProps = {
  readonly result: AnalysisResult;
};

type Insight = {
  readonly id: string;
  readonly title: string;
  readonly value: ReactNode;
  readonly hint?: ReactNode;
};

function busiestHourLabel(hours: readonly number[]): string {
  let bestIndex = 0;
  let best = -1;
  for (let i = 0; i < hours.length; i += 1) {
    const value = hours[i] ?? 0;
    if (value > best) {
      best = value;
      bestIndex = i;
    }
  }
  if (best <= 0) return '—';
  const suffix = bestIndex >= 12 ? 'pm' : 'am';
  const hour12 = bestIndex % 12 === 0 ? 12 : bestIndex % 12;
  return `${hour12}${suffix} UTC`;
}

const weekdayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function busiestDayLabel(counts: readonly number[]): string {
  let bestIndex = 0;
  let best = -1;
  for (let i = 0; i < counts.length; i += 1) {
    const value = counts[i] ?? 0;
    if (value > best) {
      best = value;
      bestIndex = i;
    }
  }
  if (best <= 0) return '—';
  return weekdayNames[bestIndex] ?? '—';
}

export function InsightsList({ result }: InsightsListProps) {
  const insights: Insight[] = [
    {
      id: 'first',
      title: 'First AI-assisted commit',
      value: result.first ? formatDate(result.first.committedAt) : '—',
      hint: result.first ? (
        <a
          href={result.first.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="text-[var(--color-accent)] hover:underline"
        >
          {result.first.repository} · {result.first.sha.slice(0, 7)}
        </a>
      ) : (
        'No AI markers detected in your commit history yet.'
      ),
    },
    {
      id: 'best',
      title: 'Best post-AI month',
      value: result.bestMonth ? `${formatNumber(result.bestMonth.commits)} commits` : '—',
      hint: result.bestMonth ? formatMonth(result.bestMonth.yearMonth) : null,
    },
    {
      id: 'streak',
      title: 'Consecutive months using AI',
      value: `${result.currentStreakMonths} mo current`,
      hint: `Longest streak: ${result.longestStreakMonths} months`,
    },
    {
      id: 'share',
      title: 'AI share of all commits',
      value: formatPercent(result.aiShare, 1),
      hint: `${formatNumber(result.totalAiCommits)} of ${formatNumber(result.totalCommits)} commits across all repos`,
    },
    {
      id: 'rhythm',
      title: 'Peak AI commit window',
      value: busiestHourLabel(result.hourHistogram),
      hint: `Most active day: ${busiestDayLabel(result.dayOfWeekHistogram)}`,
    },
    {
      id: 'days',
      title: 'Estimated dev-days reclaimed',
      value: `${result.daysSavedEstimate.toFixed(1)} days`,
      hint: 'Assuming ~25 minutes saved per AI-assisted commit, 8h workdays.',
    },
  ];

  return (
    <Card>
      <CardHeader
        title="Pattern insights"
        description="Signals derived from your AI-marked commit history."
      />
      <ul className="grid sm:grid-cols-2 gap-x-6 gap-y-5">
        {insights.map((insight) => (
          <li key={insight.id} className="flex flex-col gap-1">
            <span className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              {insight.title}
            </span>
            <span className="text-lg font-semibold text-[var(--color-text-strong)] tabular-nums">
              {insight.value}
            </span>
            {insight.hint && (
              <span className="text-xs text-[var(--color-muted)]">{insight.hint}</span>
            )}
          </li>
        ))}
      </ul>
      {result.first && (
        <div className="mt-6 rounded-[var(--radius-md)] border border-[var(--color-border)] bg-[var(--color-surface-2)] p-4">
          <div className="flex items-center gap-2 mb-2">
            <Badge tone="accent" dot>
              Patient zero
            </Badge>
            <span className="text-xs text-[var(--color-muted)]">
              Your first AI-assisted commit message
            </span>
          </div>
          <pre className="text-xs text-[var(--color-text)] whitespace-pre-wrap font-mono leading-relaxed max-h-32 overflow-y-auto">
            {result.first.message.split('\n').slice(0, 8).join('\n')}
          </pre>
        </div>
      )}
    </Card>
  );
}
