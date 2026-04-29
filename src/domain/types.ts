import type { AssistantId } from '~/domain/markers';

export type GitHubViewer = {
  readonly login: string;
  readonly name: string | null;
  readonly avatarUrl: string;
  readonly createdAt: string;
};

export type DailyContribution = {
  readonly date: string;
  readonly count: number;
};

export type MonthlyBucket = {
  readonly yearMonth: string;
  readonly commits: number;
  readonly aiCommits: number;
};

export type AssistantBreakdown = {
  readonly assistant: AssistantId;
  readonly label: string;
  readonly accent: string;
  readonly count: number;
  readonly firstSeen: string | null;
};

export type FirstAiCommit = {
  readonly sha: string;
  readonly message: string;
  readonly committedAt: string;
  readonly repository: string;
  readonly htmlUrl: string;
  readonly assistant: AssistantId;
};

export type AnalysisResult = {
  readonly viewer: GitHubViewer;
  readonly first: FirstAiCommit | null;
  readonly multiplier: number;
  readonly preMonthlyAverage: number;
  readonly postMonthlyAverage: number;
  readonly months: readonly MonthlyBucket[];
  readonly totalCommits: number;
  readonly totalAiCommits: number;
  readonly aiShare: number;
  readonly assistants: readonly AssistantBreakdown[];
  readonly bestMonth: MonthlyBucket | null;
  readonly currentStreakMonths: number;
  readonly longestStreakMonths: number;
  readonly dayOfWeekHistogram: readonly number[];
  readonly hourHistogram: readonly number[];
  readonly daysSavedEstimate: number;
};
