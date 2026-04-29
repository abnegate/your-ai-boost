import type { ReactNode } from 'react';
import type { AnalysisResult } from '~/domain/types';
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
  return `${hour12}${suffix}`;
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
      id: 'best',
      title: 'Best post-AI month',
      value: result.bestMonth ? formatNumber(result.bestMonth.commits) : '—',
      hint: result.bestMonth ? `commits in ${formatMonth(result.bestMonth.yearMonth)}` : null,
    },
    {
      id: 'streak',
      title: 'Current AI streak',
      value: `${result.currentStreakMonths} mo`,
      hint: `longest ${result.longestStreakMonths} mo`,
    },
    {
      id: 'share',
      title: 'AI share',
      value: formatPercent(result.aiShare, 1),
      hint: `${formatNumber(result.totalAiCommits)} of ${formatNumber(result.totalCommits)} commits`,
    },
    {
      id: 'rhythm',
      title: 'Peak hour',
      value: busiestHourLabel(result.hourHistogram),
      hint: `most active · ${busiestDayLabel(result.dayOfWeekHistogram)}`,
    },
    {
      id: 'days',
      title: 'Dev-days reclaimed',
      value: result.daysSavedEstimate.toFixed(1),
      hint: '~25 min saved per AI commit',
    },
    {
      id: 'first',
      title: 'First AI commit',
      value: result.first ? formatDate(result.first.committedAt) : '—',
      hint: result.first ? `${result.first.repository} · ${result.first.sha.slice(0, 7)}` : null,
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      <ul className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
        {insights.map((insight) => (
          <li
            key={insight.id}
            className="surface edge-light p-4 flex flex-col gap-2 hover:border-[var(--color-border-strong)] transition-colors"
          >
            <span className="text-[12px] font-medium text-[var(--color-muted-2)] tracking-tight">
              {insight.title}
            </span>
            <span className="text-[26px] font-semibold text-[var(--color-text-strong)] tabular-nums tracking-[-0.02em] leading-[1.05]">
              {insight.value}
            </span>
            {insight.hint && (
              <span className="text-[12px] text-[var(--color-muted)] leading-relaxed">
                {insight.hint}
              </span>
            )}
          </li>
        ))}
      </ul>

      {result.first && (
        <aside className="col-span-12 lg:col-span-4 surface edge-light p-5 flex flex-col gap-3 self-start">
          <div className="flex items-baseline justify-between">
            <h4 className="text-[13px] font-medium text-[var(--color-text-strong)] tracking-tight">
              Patient zero
            </h4>
            <span className="text-[11px] text-[var(--color-muted)] tabular-nums">
              {formatDate(result.first.committedAt)}
            </span>
          </div>
          <div className="text-[12px] text-[var(--color-muted-2)] tabular-nums truncate">
            {result.first.repository} ·{' '}
            <span className="font-mono">{result.first.sha.slice(0, 7)}</span>
          </div>
          <pre className="text-[12px] text-[var(--color-text)] whitespace-pre-wrap font-mono leading-[1.55] max-h-44 overflow-y-auto rounded-[var(--radius-sm)] bg-[var(--color-bg-elev)] border border-[var(--color-border)] p-3">
            {result.first.message.split('\n').slice(0, 10).join('\n')}
          </pre>
          <a
            href={result.first.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="self-end text-[12px] text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors"
          >
            Open on GitHub →
          </a>
        </aside>
      )}
    </div>
  );
}
