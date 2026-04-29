import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import { analyze } from '~/domain/analyzer';
import type { AnalysisResult } from '~/domain/types';
import {
  createGithubClient,
  deriveFirstAiCommit,
  fetchDailyContributions,
  fetchViewer,
  searchAssistantCommits,
} from '~/lib/github';

export function useAnalysis(token: string | undefined) {
  const octokit = useMemo(() => (token ? createGithubClient(token) : null), [token]);

  return useQuery<AnalysisResult>({
    queryKey: ['analysis', token?.slice(-12) ?? 'none'],
    enabled: !!octokit,
    staleTime: 10 * 60 * 1000,
    queryFn: async () => {
      if (!octokit) throw new Error('Octokit unavailable');
      const viewer = await fetchViewer(octokit);
      const [daily, assistantResults] = await Promise.all([
        fetchDailyContributions(octokit, new Date(viewer.createdAt), new Date()),
        searchAssistantCommits(octokit, viewer.login),
      ]);
      const first = deriveFirstAiCommit(assistantResults);
      return analyze({ viewer, daily, assistantResults, first });
    },
  });
}
