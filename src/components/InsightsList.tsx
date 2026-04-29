import type { ReactNode } from 'react';
import type { AnalysisResult } from '~/domain/types';
import { formatDate, formatMonth, formatNumber, formatPercent } from '~/lib/format';

type InsightsListProps = {
  readonly result: AnalysisResult;
};

type Insight = {
  readonly id: string;
  readonly index: string;
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

const circled = ['❶', '❷', '❸', '❹', '❺', '❻'];

export function InsightsList({ result }: InsightsListProps) {
  const insights: Insight[] = [
    {
      id: 'first',
      index: '01',
      title: 'First AI-assisted commit',
      value: result.first ? formatDate(result.first.committedAt) : '—',
      hint: result.first ? (
        <a
          href={result.first.htmlUrl}
          target="_blank"
          rel="noreferrer"
          className="font-mono text-[11px] text-[var(--color-accent)] hover:underline"
        >
          {result.first.repository} · {result.first.sha.slice(0, 7)}
        </a>
      ) : (
        'No AI markers detected in your commit history yet.'
      ),
    },
    {
      id: 'best',
      index: '02',
      title: 'Best post-AI month',
      value: result.bestMonth ? `${formatNumber(result.bestMonth.commits)}` : '—',
      hint: result.bestMonth ? `commits in ${formatMonth(result.bestMonth.yearMonth)}` : null,
    },
    {
      id: 'streak',
      index: '03',
      title: 'Streak of months using AI',
      value: `${result.currentStreakMonths}`,
      hint: `current · longest streak ${result.longestStreakMonths} months`,
    },
    {
      id: 'share',
      index: '04',
      title: 'AI share of all commits',
      value: formatPercent(result.aiShare, 1),
      hint: `${formatNumber(result.totalAiCommits)} of ${formatNumber(result.totalCommits)} commits across all repos`,
    },
    {
      id: 'rhythm',
      index: '05',
      title: 'Peak commit window',
      value: busiestHourLabel(result.hourHistogram),
      hint: `most active day · ${busiestDayLabel(result.dayOfWeekHistogram)}`,
    },
    {
      id: 'days',
      index: '06',
      title: 'Estimated dev-days reclaimed',
      value: result.daysSavedEstimate.toFixed(1),
      hint: '@ ~25 minutes saved per AI-assisted commit, 8h workdays',
    },
  ];

  return (
    <div className="grid grid-cols-12 gap-6">
      {/* Notes */}
      <ol className="col-span-12 lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-6">
        {insights.map((insight, i) => (
          <li
            key={insight.id}
            className="flex gap-3 pt-3 border-t border-dashed border-[var(--color-border)]"
          >
            <span
              aria-hidden
              className="font-mono text-[14px] text-[var(--color-accent)] mt-0.5 select-none"
            >
              {circled[i] ?? insight.index}
            </span>
            <div className="flex flex-col gap-1.5 min-w-0">
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                {insight.title}
              </span>
              <span className="display italic text-[34px] leading-[0.95] text-[var(--color-paper)] tabular-nums">
                {insight.value}
              </span>
              {insight.hint && (
                <span className="text-[12px] text-[var(--color-muted)] leading-relaxed">
                  {insight.hint}
                </span>
              )}
            </div>
          </li>
        ))}
      </ol>

      {/* Patient zero — exhibit card */}
      {result.first && (
        <aside className="col-span-12 lg:col-span-4 panel p-5 flex flex-col gap-3 self-start">
          <div className="flex items-baseline justify-between pb-3 border-b border-[var(--color-border)]">
            <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-accent)]">
              Exhibit A
            </span>
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)]">
              Patient zero
            </span>
          </div>
          <div className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)] tabular-nums">
            {formatDate(result.first.committedAt)} · {result.first.repository} ·{' '}
            {result.first.sha.slice(0, 7)}
          </div>
          <pre className="text-[12px] text-[var(--color-text)] whitespace-pre-wrap font-mono leading-[1.55] max-h-44 overflow-y-auto pl-3 border-l border-[var(--color-accent)] bg-[var(--color-surface-2)] py-2 pr-2">
            {result.first.message.split('\n').slice(0, 10).join('\n')}
          </pre>
          <a
            href={result.first.htmlUrl}
            target="_blank"
            rel="noreferrer"
            className="self-end font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-paper)]"
          >
            Open on GitHub ↗
          </a>
        </aside>
      )}
    </div>
  );
}
