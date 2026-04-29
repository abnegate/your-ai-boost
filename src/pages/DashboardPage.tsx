import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AssistantBreakdown } from '~/components/charts/AssistantBreakdown';
import { HourHeatmap } from '~/components/charts/HourHeatmap';
import { MonthlyChart } from '~/components/charts/MonthlyChart';
import { WeekdayBars } from '~/components/charts/WeekdayBars';
import { BoostHero } from '~/components/BoostHero';
import { EmptyState } from '~/components/EmptyState';
import { InsightsList } from '~/components/InsightsList';
import { AppShell } from '~/components/layout/AppShell';
import { Button } from '~/components/ui/Button';
import { Card, CardHeader } from '~/components/ui/Card';
import { Spinner } from '~/components/ui/Spinner';
import { demoAnalysis } from '~/domain/demo';
import type { AnalysisResult } from '~/domain/types';
import { useAnalysis } from '~/hooks/useAnalysis';
import { useSession } from '~/hooks/useSession';
import { loginWithGitHub } from '~/lib/appwrite';

type DemoState = 'off' | 'ready' | 'loading' | 'empty' | 'error';

function readDemoState(value: string | null): DemoState {
  switch (value) {
    case '1':
    case 'ready':
      return 'ready';
    case 'loading':
      return 'loading';
    case 'empty':
      return 'empty';
    case 'error':
      return 'error';
    default:
      return 'off';
  }
}

export function DashboardPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const demoState = readDemoState(params.get('demo'));
  const liveAnalysis = useAnalysis(demoState === 'off' ? session.data?.githubToken : undefined);

  useEffect(() => {
    if (demoState !== 'off') return;
    if (!session.isLoading && !session.data) {
      navigate('/', { replace: true });
    }
  }, [demoState, session.isLoading, session.data, navigate]);

  if (demoState === 'off' && (session.isLoading || !session.data)) {
    return (
      <AppShell>
        <div className="grid place-items-center py-32">
          <Spinner label="Checking your session…" />
        </div>
      </AppShell>
    );
  }

  const isLoading = demoState === 'loading' || (demoState === 'off' && liveAnalysis.isLoading);
  const errorMessage =
    demoState === 'error'
      ? 'Demo error: rate-limited by GitHub (5000 req/hour exceeded). Retrying in 12m.'
      : demoState === 'off' && liveAnalysis.error instanceof Error
        ? liveAnalysis.error.message
        : null;
  const result: AnalysisResult | undefined =
    demoState === 'ready'
      ? demoAnalysis
      : demoState === 'empty'
        ? { ...demoAnalysis, first: null, totalAiCommits: 0, assistants: [] }
        : demoState === 'off'
          ? liveAnalysis.data
          : undefined;

  const viewer = result?.viewer ?? (demoState !== 'off' ? demoAnalysis.viewer : undefined);

  return (
    <AppShell githubLogin={viewer?.login} avatarUrl={viewer?.avatarUrl}>
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-8">
        {isLoading && (
          <Card>
            <div className="flex items-center gap-3 py-6">
              <Spinner />
              <div>
                <div className="text-sm font-medium text-[var(--color-text-strong)]">
                  Scanning your commit history
                </div>
                <div className="text-xs text-[var(--color-muted)] mt-0.5">
                  Reading contribution graph and searching for AI markers across all your repos.
                </div>
              </div>
            </div>
          </Card>
        )}

        {errorMessage && (
          <EmptyState
            title="Could not load your GitHub data"
            description={errorMessage}
            action={
              <div className="flex gap-3">
                <Button onClick={() => liveAnalysis.refetch()}>Retry</Button>
                <Button variant="secondary" onClick={loginWithGitHub}>
                  Re-authorise GitHub
                </Button>
              </div>
            }
          />
        )}

        {result && !result.first && (
          <EmptyState
            title="No AI markers found yet"
            description="Your commit history doesn't include any of the canonical AI co-author signatures. Once you commit with Claude Code, Copilot, Cursor, or similar, your boost will appear here."
          />
        )}

        {result && result.first && (
          <>
            <BoostHero result={result} />

            <div className="grid lg:grid-cols-[2fr_1fr] gap-6">
              <Card>
                <CardHeader
                  title="Monthly commits over time"
                  description="The dashed line marks your first AI-assisted commit. The green line tracks AI commits per month."
                />
                <MonthlyChart
                  months={result.months}
                  firstAiMonth={result.first.committedAt.slice(0, 7)}
                />
              </Card>
              <Card>
                <CardHeader
                  title="Assistant mix"
                  description="Share of AI-marked commits by tool."
                />
                <AssistantBreakdown assistants={result.assistants} />
              </Card>
            </div>

            <InsightsList result={result} />

            <div className="grid lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader
                  title="Hour of day"
                  description="When you commit AI-assisted work (UTC)."
                />
                <HourHeatmap hours={result.hourHistogram} />
              </Card>
              <Card>
                <CardHeader
                  title="Day of week"
                  description="AI-marked commits by weekday across the sample."
                />
                <WeekdayBars counts={result.dayOfWeekHistogram} />
              </Card>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
