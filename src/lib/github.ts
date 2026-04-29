import { Octokit } from 'octokit';
import { buildAssistantQuery, detectAssistant, markers, type AssistantId } from '~/domain/markers';
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

export const lookbackYears = 2;

// Walk backwards from `until` in 1-year windows, capped at `lookbackYears`.
// `earliest` clips the lookback so we don't query before the account existed.
// Walking backwards (instead of forwards from oldest) means we always have the
// most recent data first — if a request fails partway we still get usable
// recent history rather than ancient noise.
export async function fetchDailyContributions(
  octokit: Octokit,
  earliest: Date,
  until: Date,
): Promise<DailyContribution[]> {
  const lookbackStart = new Date(until);
  lookbackStart.setUTCFullYear(lookbackStart.getUTCFullYear() - lookbackYears);
  const stop = new Date(Math.max(lookbackStart.getTime(), earliest.getTime()));

  const result: DailyContribution[] = [];
  let windowEnd = new Date(until);

  while (windowEnd.getTime() > stop.getTime()) {
    const windowStart = new Date(windowEnd);
    windowStart.setUTCFullYear(windowStart.getUTCFullYear() - 1);
    windowStart.setUTCDate(windowStart.getUTCDate() + 1);
    if (windowStart.getTime() < stop.getTime()) {
      windowStart.setTime(stop.getTime());
    }

    const data = await octokit.graphql<ContribQueryResponse>(contribQuery, {
      from: windowStart.toISOString(),
      to: windowEnd.toISOString(),
    });

    for (const week of data.viewer.contributionsCollection.contributionCalendar.weeks) {
      for (const day of week.contributionDays) {
        result.push({ date: day.date, count: day.contributionCount });
      }
    }

    windowEnd = new Date(windowStart);
    windowEnd.setUTCDate(windowEnd.getUTCDate() - 1);
  }

  const seen = new Set<string>();
  return result
    .filter((d) => (seen.has(d.date) ? false : (seen.add(d.date), true)))
    .sort((a, b) => a.date.localeCompare(b.date));
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
  since?: Date,
): Promise<{ totalCount: number; items: SearchCommitItem[] }> {
  const dateFilter = since ? ` author-date:>=${since.toISOString().slice(0, 10)}` : '';
  const q = `author:${login} ${query}${dateFilter}`;
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
  // Window the marker search to the same lookback as the contribution graph.
  // Patient zero uses an unrestricted asc query (cheap — single record) so
  // we can still spot AI usage that started before the lookback window.
  const since = new Date();
  since.setUTCFullYear(since.getUTCFullYear() - lookbackYears);

  return Promise.all(
    markers.map(async (marker): Promise<AssistantSearchResult> => {
      const query = buildAssistantQuery(marker);
      try {
        const [first, recent] = await Promise.all([
          searchCommitsForQuery(octokit, login, marker, query, 'asc', 1),
          searchCommitsForQuery(octokit, login, marker, query, 'desc', 100, since),
        ]);
        return {
          assistant: marker.assistant,
          totalCount: recent.totalCount, // count within lookback window
          first: first.items[0] ?? null, // patient zero from full history
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
