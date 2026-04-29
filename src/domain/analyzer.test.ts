import { describe, expect, test } from 'bun:test';
import { analyze, type AnalyzeInput } from '~/domain/analyzer';
import type { DailyContribution, GitHubViewer } from '~/domain/types';
import type { AssistantSearchResult, SearchCommitItem } from '~/lib/github';

const viewer: GitHubViewer = {
  login: 'demo',
  name: 'Demo User',
  avatarUrl: 'https://example.com/avatar.png',
  createdAt: '2023-01-01T00:00:00Z',
};

function buildDaily(monthlyTotals: Record<string, number>): DailyContribution[] {
  const out: DailyContribution[] = [];
  for (const [yearMonth, total] of Object.entries(monthlyTotals)) {
    const [year, month] = yearMonth.split('-').map(Number) as [number, number];
    out.push({ date: `${year}-${String(month).padStart(2, '0')}-15`, count: total });
  }
  return out;
}

function buildSearch(
  assistant: SearchCommitItem['assistant'],
  totalCount: number,
  samples: SearchCommitItem[] = [],
  first: SearchCommitItem | null = null,
): AssistantSearchResult {
  return { assistant, totalCount, samples, first };
}

function sample(
  assistant: SearchCommitItem['assistant'],
  committedAt: string,
  message = 'feat: thing',
): SearchCommitItem {
  return {
    sha: `sha-${committedAt}`,
    message,
    committedAt,
    repository: 'demo/repo',
    htmlUrl: `https://github.com/demo/repo/commit/${committedAt}`,
    assistant,
  };
}

describe('analyze', () => {
  test('computes pre/post averages and the multiplier', () => {
    // Use a viewer created two months ago so the test is deterministic regardless of "now".
    const now = new Date();
    const lastFull = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - 1, 1));
    const month = (offset: number) => {
      const d = new Date(Date.UTC(lastFull.getUTCFullYear(), lastFull.getUTCMonth() - offset, 1));
      return `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, '0')}`;
    };
    const m = (offset: number, count: number) => ({ [month(offset)]: count });

    const daily = buildDaily({
      ...m(5, 10),
      ...m(4, 10),
      ...m(3, 10),
      ...m(2, 50),
      ...m(1, 50),
      ...m(0, 50),
    });

    const created = new Date(
      Date.UTC(lastFull.getUTCFullYear(), lastFull.getUTCMonth() - 5, 1),
    ).toISOString();

    const firstAiCommit = sample('claude', `${month(2)}-15T00:00:00Z`);
    const input: AnalyzeInput = {
      viewer: { ...viewer, createdAt: created },
      daily,
      assistantResults: [buildSearch('claude', 25, [firstAiCommit], firstAiCommit)],
      first: {
        sha: firstAiCommit.sha,
        message: firstAiCommit.message,
        committedAt: firstAiCommit.committedAt,
        repository: firstAiCommit.repository,
        htmlUrl: firstAiCommit.htmlUrl,
        assistant: 'claude',
      },
    };

    const result = analyze(input);
    expect(result.preMonthlyAverage).toBe(10);
    expect(result.postMonthlyAverage).toBe(50);
    expect(result.multiplier).toBe(5);
    expect(result.totalAiCommits).toBe(25);
    expect(result.totalCommits).toBe(180);
    expect(result.bestMonth?.commits).toBe(50);
  });

  test('multiplier is 0 when there is no pre-AI baseline', () => {
    const result = analyze({
      viewer,
      daily: [{ date: '2023-02-15', count: 8 }],
      assistantResults: [],
      first: null,
    });
    expect(result.multiplier).toBe(0);
    expect(result.first).toBeNull();
  });

  test('aiShare clamps to 1 when AI counts exceed total contributions', () => {
    const result = analyze({
      viewer,
      daily: [{ date: '2023-02-15', count: 10 }],
      assistantResults: [buildSearch('claude', 999)],
      first: null,
    });
    expect(result.aiShare).toBe(1);
  });

  test('day-of-week and hour histograms reflect AI commit timestamps', () => {
    // 2024-01-01 is Monday (UTC), hour 14
    const samples = [
      sample('claude', '2024-01-01T14:30:00Z'),
      sample('claude', '2024-01-01T14:45:00Z'),
    ];
    const result = analyze({
      viewer,
      daily: [],
      assistantResults: [buildSearch('claude', 2, samples, samples[0] ?? null)],
      first: null,
    });
    expect(result.dayOfWeekHistogram[1]).toBe(2); // Monday
    expect(result.hourHistogram[14]).toBe(2);
  });

  test('streaks count consecutive months with AI commits since the first', () => {
    const start = '2024-01';
    const samples = [
      sample('claude', '2024-01-10T00:00:00Z'),
      sample('claude', '2024-02-10T00:00:00Z'),
      sample('claude', '2024-03-10T00:00:00Z'),
      sample('claude', '2024-05-10T00:00:00Z'),
      sample('claude', '2024-06-10T00:00:00Z'),
    ];

    const result = analyze({
      viewer: { ...viewer, createdAt: '2024-01-01T00:00:00Z' },
      daily: [],
      assistantResults: [buildSearch('claude', samples.length, samples, samples[0] ?? null)],
      first: {
        sha: 'first',
        message: 'first',
        committedAt: '2024-01-10T00:00:00Z',
        repository: 'demo/repo',
        htmlUrl: '',
        assistant: 'claude',
      },
    });

    expect(result.first?.committedAt.slice(0, 7)).toBe(start);
    expect(result.longestStreakMonths).toBeGreaterThanOrEqual(3);
  });
});
