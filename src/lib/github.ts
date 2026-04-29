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
  viewer: {
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
  };
};

// Query the authenticated viewer's own contribution graph. This includes their
// private-repo contribution counts (without granting us access to private code)
// as long as they have "Show private contributions" enabled on their profile.
const contribQuery = /* GraphQL */ `
  query Contributions($from: DateTime!, $to: DateTime!) {
    viewer {
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
      from: cursor.toISOString(),
      to: clampedEnd.toISOString(),
    });

    for (const week of data.viewer.contributionsCollection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        result.push({ date: day.date, count: day.contributionCount });
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
  // Run all assistant searches in parallel; each assistant has exactly two
  // calls (oldest commit + most-recent samples) using the canonical query.
  return Promise.all(
    markers.map(async (marker): Promise<AssistantSearchResult> => {
      try {
        const [first, recent] = await Promise.all([
          searchCommitsForQuery(octokit, login, marker, marker.primaryQuery, 'asc', 1),
          searchCommitsForQuery(octokit, login, marker, marker.primaryQuery, 'desc', 100),
        ]);
        return {
          assistant: marker.assistant,
          totalCount: first.totalCount,
          first: first.items[0] ?? null,
          samples: recent.items,
        };
      } catch (error) {
        console.warn(`search failed for ${marker.label}`, error);
        return { assistant: marker.assistant, totalCount: 0, first: null, samples: [] };
      }
    }),
  );
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
