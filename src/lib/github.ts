import { Octokit } from 'octokit';
import { detectAssistant, markers, type AssistantId } from '~/domain/markers';
import type { DailyContribution, FirstAiCommit, GitHubViewer } from '~/domain/types';

const userAgent = 'your-ai-boost (https://github.com)';

export function createGithubClient(token: string): Octokit {
  return new Octokit({ auth: token, userAgent });
}

type ViewerQueryResponse = {
  viewer: {
    login: string;
    name: string | null;
    avatarUrl: string;
    createdAt: string;
  };
};

const viewerQuery = /* GraphQL */ `
  query Viewer {
    viewer {
      login
      name
      avatarUrl(size: 256)
      createdAt
    }
  }
`;

export async function fetchViewer(octokit: Octokit): Promise<GitHubViewer> {
  const data = await octokit.graphql<ViewerQueryResponse>(viewerQuery);
  return {
    login: data.viewer.login,
    name: data.viewer.name,
    avatarUrl: data.viewer.avatarUrl,
    createdAt: data.viewer.createdAt,
  };
}

type ContribQueryResponse = {
  user: {
    contributionsCollection: {
      contributionCalendar: {
        weeks: Array<{
          contributionDays: Array<{
            date: string;
            contributionCount: number;
          }>;
        }>;
      };
    };
  } | null;
};

const contribQuery = /* GraphQL */ `
  query Contributions($login: String!, $from: DateTime!, $to: DateTime!) {
    user(login: $login) {
      contributionsCollection(from: $from, to: $to) {
        contributionCalendar {
          weeks {
            contributionDays {
              date
              contributionCount
            }
          }
        }
      }
    }
  }
`;

export async function fetchDailyContributions(
  octokit: Octokit,
  login: string,
  since: Date,
  until: Date,
): Promise<DailyContribution[]> {
  const result: DailyContribution[] = [];
  let cursor = new Date(Date.UTC(since.getUTCFullYear(), since.getUTCMonth(), since.getUTCDate()));
  const stop = until.getTime();

  while (cursor.getTime() <= stop) {
    const windowEnd = new Date(cursor.getTime());
    windowEnd.setUTCFullYear(windowEnd.getUTCFullYear() + 1);
    windowEnd.setUTCDate(windowEnd.getUTCDate() - 1);
    const clampedEnd = new Date(Math.min(windowEnd.getTime(), stop));

    const data = await octokit.graphql<ContribQueryResponse>(contribQuery, {
      login,
      from: cursor.toISOString(),
      to: clampedEnd.toISOString(),
    });

    if (data.user) {
      for (const week of data.user.contributionsCollection.contributionCalendar.weeks) {
        for (const day of week.contributionDays) {
          result.push({ date: day.date, count: day.contributionCount });
        }
      }
    }

    cursor = new Date(clampedEnd.getTime());
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }

  const seen = new Set<string>();
  return result.filter((d) => (seen.has(d.date) ? false : (seen.add(d.date), true)));
}

export type SearchCommitItem = {
  readonly sha: string;
  readonly message: string;
  readonly committedAt: string;
  readonly repository: string;
  readonly htmlUrl: string;
  readonly assistant: AssistantId;
};

export type AssistantSearchResult = {
  readonly assistant: AssistantId;
  readonly totalCount: number;
  readonly first: SearchCommitItem | null;
  readonly samples: readonly SearchCommitItem[];
};

async function searchCommitsForQuery(
  octokit: Octokit,
  login: string,
  marker: (typeof markers)[number],
  query: string,
  order: 'asc' | 'desc',
  perPage: number,
): Promise<{ totalCount: number; items: SearchCommitItem[] }> {
  const q = `author:${login} ${query}`;
  const response = await octokit.request('GET /search/commits', {
    q,
    sort: 'author-date',
    order,
    per_page: perPage,
  });
  const items: SearchCommitItem[] = response.data.items.map((item) => ({
    sha: item.sha,
    message: item.commit.message,
    committedAt: item.commit.author?.date ?? item.commit.committer?.date ?? '',
    repository: item.repository.full_name,
    htmlUrl: item.html_url,
    assistant: marker.assistant,
  }));
  return { totalCount: response.data.total_count, items };
}

export async function searchAssistantCommits(
  octokit: Octokit,
  login: string,
): Promise<AssistantSearchResult[]> {
  const results: AssistantSearchResult[] = [];

  for (const marker of markers) {
    let totalCount = 0;
    let earliest: SearchCommitItem | null = null;
    const samples: SearchCommitItem[] = [];

    for (const query of marker.queries) {
      try {
        const first = await searchCommitsForQuery(octokit, login, marker, query, 'asc', 1);
        totalCount += first.totalCount;
        const candidate = first.items[0];
        if (candidate) {
          if (!earliest || candidate.committedAt < earliest.committedAt) {
            earliest = candidate;
          }
        }
        const recent = await searchCommitsForQuery(octokit, login, marker, query, 'desc', 30);
        for (const item of recent.items) samples.push(item);
      } catch (error) {
        console.warn(`search failed for ${marker.label}`, error);
      }
    }

    results.push({
      assistant: marker.assistant,
      totalCount,
      first: earliest,
      samples,
    });
  }

  return results;
}

export function deriveFirstAiCommit(
  results: readonly AssistantSearchResult[],
): FirstAiCommit | null {
  let earliest: SearchCommitItem | null = null;
  for (const result of results) {
    const candidate = result.first;
    if (!candidate || !candidate.committedAt) continue;
    if (!earliest || candidate.committedAt < earliest.committedAt) {
      earliest = candidate;
    }
  }
  if (!earliest) return null;
  const detected = detectAssistant(earliest.message) ?? earliest.assistant;
  return {
    sha: earliest.sha,
    message: earliest.message,
    committedAt: earliest.committedAt,
    repository: earliest.repository,
    htmlUrl: earliest.htmlUrl,
    assistant: detected,
  };
}
