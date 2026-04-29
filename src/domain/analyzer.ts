import { markersByAssistant } from '~/domain/markers';
import type {
  AnalysisResult,
  AssistantBreakdown,
  DailyContribution,
  FirstAiCommit,
  GitHubViewer,
  MonthlyBucket,
} from '~/domain/types';
import type { AssistantSearchResult, SearchCommitItem } from '~/lib/github';

const minutesSavedPerAiCommit = 25;

function toYearMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

function bucketByMonth(days: readonly DailyContribution[]): Map<string, number> {
  const buckets = new Map<string, number>();
  for (const day of days) {
    const yearMonth = day.date.slice(0, 7);
    buckets.set(yearMonth, (buckets.get(yearMonth) ?? 0) + day.count);
  }
  return buckets;
}

function bucketAiCommitsByMonth(samples: readonly SearchCommitItem[]): Map<string, number> {
  const buckets = new Map<string, number>();
  for (const sample of samples) {
    if (!sample.committedAt) continue;
    const yearMonth = sample.committedAt.slice(0, 7);
    buckets.set(yearMonth, (buckets.get(yearMonth) ?? 0) + 1);
  }
  return buckets;
}

function buildMonths(
  totalsByMonth: Map<string, number>,
  aiByMonth: Map<string, number>,
  start: Date,
  end: Date,
): MonthlyBucket[] {
  const out: MonthlyBucket[] = [];
  let cursor = new Date(Date.UTC(start.getUTCFullYear(), start.getUTCMonth(), 1));
  const stop = new Date(Date.UTC(end.getUTCFullYear(), end.getUTCMonth(), 1));

  while (cursor.getTime() <= stop.getTime()) {
    const yearMonth = toYearMonth(cursor);
    out.push({
      yearMonth,
      commits: totalsByMonth.get(yearMonth) ?? 0,
      aiCommits: aiByMonth.get(yearMonth) ?? 0,
    });
    cursor = new Date(Date.UTC(cursor.getUTCFullYear(), cursor.getUTCMonth() + 1, 1));
  }
  return out;
}

function average(values: readonly number[]): number {
  if (values.length === 0) return 0;
  let sum = 0;
  for (const value of values) sum += value;
  return sum / values.length;
}

function computeStreaks(
  months: readonly MonthlyBucket[],
  firstAiMonth: string | null,
): { current: number; longest: number } {
  if (!firstAiMonth) return { current: 0, longest: 0 };
  let longest = 0;
  let current = 0;
  let running = 0;
  for (const month of months) {
    if (month.yearMonth < firstAiMonth) continue;
    if (month.aiCommits > 0) {
      running += 1;
      longest = Math.max(longest, running);
      current = running;
    } else {
      running = 0;
      current = 0;
    }
  }
  return { current, longest };
}

function buildAssistantBreakdowns(results: readonly AssistantSearchResult[]): AssistantBreakdown[] {
  return results
    .map((result) => {
      const definition = markersByAssistant.get(result.assistant);
      if (!definition) return null;
      const breakdown: AssistantBreakdown = {
        assistant: result.assistant,
        label: definition.label,
        accent: definition.accent,
        count: result.totalCount,
        firstSeen: result.first?.committedAt ?? null,
      };
      return breakdown;
    })
    .filter((b): b is AssistantBreakdown => b !== null && b.count > 0)
    .sort((a, b) => b.count - a.count);
}

function buildHistograms(samples: readonly SearchCommitItem[]): {
  dayOfWeek: number[];
  hour: number[];
} {
  const dayOfWeek = new Array<number>(7).fill(0);
  const hour = new Array<number>(24).fill(0);
  for (const sample of samples) {
    if (!sample.committedAt) continue;
    const date = new Date(sample.committedAt);
    if (Number.isNaN(date.getTime())) continue;
    // Local time: matches when the user actually shipped from their seat.
    dayOfWeek[date.getDay()] = (dayOfWeek[date.getDay()] ?? 0) + 1;
    hour[date.getHours()] = (hour[date.getHours()] ?? 0) + 1;
  }
  return { dayOfWeek, hour };
}

const chartMonthsBeforeAiStart = 6;

// Slice months to a window suitable for charting: 6 months before the AI start
// through now. Full history is kept on `months` for averaging / streak math.
function windowMonths(
  months: readonly MonthlyBucket[],
  firstAiMonth: string | null,
): MonthlyBucket[] {
  if (!firstAiMonth) return months.slice(-12);
  const firstIndex = months.findIndex((m) => m.yearMonth >= firstAiMonth);
  if (firstIndex < 0) return months.slice();
  const start = Math.max(0, firstIndex - chartMonthsBeforeAiStart);
  return months.slice(start);
}

export type AnalyzeInput = {
  readonly viewer: GitHubViewer;
  readonly daily: readonly DailyContribution[];
  readonly assistantResults: readonly AssistantSearchResult[];
  readonly first: FirstAiCommit | null;
};

export function analyze(input: AnalyzeInput): AnalysisResult {
  const { viewer, daily, assistantResults, first } = input;

  const allAiSamples: SearchCommitItem[] = [];
  for (const result of assistantResults) {
    for (const sample of result.samples) allAiSamples.push(sample);
  }

  const totalsByMonth = bucketByMonth(daily);
  const aiByMonth = bucketAiCommitsByMonth(allAiSamples);

  const now = new Date();
  // Window analysis to the actual fetched data range (rather than account
  // creation), so months / averages reflect what we can see — not e.g. years
  // of zeros for an account older than the lookback.
  const dataStart =
    daily.length > 0 ? new Date(`${daily[0]!.date}T00:00:00Z`) : new Date(viewer.createdAt);
  const months = buildMonths(totalsByMonth, aiByMonth, dataStart, now);

  let totalCommits = 0;
  for (const day of daily) totalCommits += day.count;

  let totalAiCommits = 0;
  for (const result of assistantResults) totalAiCommits += result.totalCount;

  const currentYearMonth = toYearMonth(now);
  const firstAiMonth = first ? first.committedAt.slice(0, 7) : null;

  const completeMonths = months.filter((m) => m.yearMonth !== currentYearMonth);

  const preMonths = firstAiMonth
    ? completeMonths.filter((m) => m.yearMonth < firstAiMonth)
    : completeMonths;
  const postMonths = firstAiMonth ? completeMonths.filter((m) => m.yearMonth >= firstAiMonth) : [];

  const preAverage = average(preMonths.map((m) => m.commits));
  const postAverage = average(postMonths.map((m) => m.commits));
  const multiplier = preAverage > 0 ? postAverage / preAverage : 0;

  const aiShare = totalCommits > 0 ? Math.min(1, totalAiCommits / totalCommits) : 0;

  const bestMonth =
    postMonths.length > 0
      ? postMonths.reduce((best, month) => (month.commits > best.commits ? month : best))
      : null;

  const streaks = computeStreaks(months, firstAiMonth);
  const { dayOfWeek, hour } = buildHistograms(allAiSamples);

  const daysSavedEstimate = (totalAiCommits * minutesSavedPerAiCommit) / 60 / 8;

  return {
    viewer,
    first,
    multiplier,
    preMonthlyAverage: preAverage,
    postMonthlyAverage: postAverage,
    months,
    chartMonths: windowMonths(months, firstAiMonth),
    totalCommits,
    totalAiCommits,
    aiShare,
    assistants: buildAssistantBreakdowns(assistantResults),
    bestMonth,
    currentStreakMonths: streaks.current,
    longestStreakMonths: streaks.longest,
    dayOfWeekHistogram: dayOfWeek,
    hourHistogram: hour,
    daysSavedEstimate,
  };
}
