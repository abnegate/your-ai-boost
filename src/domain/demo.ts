import { markersByAssistant } from '~/domain/markers';
import type {
  AnalysisResult,
  AssistantBreakdown,
  FirstAiCommit,
  MonthlyBucket,
} from '~/domain/types';

function makeMonths(): MonthlyBucket[] {
  const now = new Date();
  const months: MonthlyBucket[] = [];
  for (let i = 23; i >= 0; i -= 1) {
    const date = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() - i, 1));
    const year = date.getUTCFullYear();
    const month = String(date.getUTCMonth() + 1).padStart(2, '0');
    const yearMonth = `${year}-${month}`;
    const isPostAi = i < 14;
    const seasonalNoise = Math.round(8 * Math.sin(i / 2));
    const baselinePre = 22 + seasonalNoise;
    const baselinePost = 78 + seasonalNoise + (i < 6 ? 18 : 0);
    const commits = Math.max(0, isPostAi ? baselinePost : baselinePre);
    const aiCommits = isPostAi ? Math.max(0, Math.round(commits * 0.42)) : 0;
    months.push({ yearMonth, commits, aiCommits });
  }
  return months;
}

function makeAssistants(): AssistantBreakdown[] {
  const layout: ReadonlyArray<readonly [string, number]> = [
    ['claude', 412],
    ['copilot', 188],
    ['cursor', 64],
    ['aider', 19],
    ['cline', 7],
  ];
  const seen = new Set<string>();
  return layout
    .map(([id, count]): AssistantBreakdown | null => {
      if (seen.has(id)) return null;
      seen.add(id);
      const definition = markersByAssistant.get(id as AssistantBreakdown['assistant']);
      if (!definition) return null;
      return {
        assistant: definition.assistant,
        label: definition.label,
        accent: definition.accent,
        count,
        firstSeen: '2025-03-12T10:14:00Z',
      };
    })
    .filter((entry): entry is AssistantBreakdown => entry !== null);
}

const first: FirstAiCommit = {
  sha: '7a1c84efea7430b0f4b8d2',
  message:
    'feat(api): wire up streaming responses for chat endpoint\n\nUses ReadableStream and AbortController so cancellations propagate.\n\n🤖 Generated with Claude Code\nCo-Authored-By: Claude <noreply@anthropic.com>',
  committedAt: '2025-03-12T10:14:00Z',
  repository: 'abnegate/lambent',
  htmlUrl: 'https://github.com/abnegate/lambent/commit/7a1c84e',
  assistant: 'claude',
};

const months = makeMonths();
const assistants = makeAssistants();
const totalAiCommits = assistants.reduce((sum, a) => sum + a.count, 0);
const totalCommits = months.reduce((sum, m) => sum + m.commits, 0);
const postMonths = months.filter((m) => m.yearMonth >= '2025-03');
const preMonths = months.filter((m) => m.yearMonth < '2025-03');
const avg = (xs: readonly number[]) =>
  xs.length === 0 ? 0 : xs.reduce((a, b) => a + b, 0) / xs.length;
const preAverage = avg(preMonths.map((m) => m.commits));
const postAverage = avg(postMonths.map((m) => m.commits));
const bestMonth = postMonths.reduce(
  (best, m) => (m.commits > best.commits ? m : best),
  postMonths[0] ?? months[0]!,
);

export const demoAnalysis: AnalysisResult = {
  viewer: {
    login: 'abnegate',
    name: 'Jake Barnby',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345?v=4',
    createdAt: '2018-01-04T00:00:00Z',
  },
  first,
  multiplier: postAverage / preAverage,
  preMonthlyAverage: preAverage,
  postMonthlyAverage: postAverage,
  months,
  totalCommits,
  totalAiCommits,
  aiShare: totalAiCommits / totalCommits,
  assistants,
  bestMonth,
  currentStreakMonths: 14,
  longestStreakMonths: 14,
  dayOfWeekHistogram: [12, 84, 96, 112, 104, 78, 22],
  hourHistogram: [
    1, 0, 0, 0, 0, 0, 2, 6, 14, 22, 30, 38, 42, 36, 30, 28, 24, 20, 16, 12, 9, 6, 3, 2,
  ],
  daysSavedEstimate: (totalAiCommits * 25) / 60 / 8,
};
