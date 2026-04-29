import { useNavigate } from 'react-router';
import { useEffect } from 'react';
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
import { useAnalysis } from '~/hooks/useAnalysis';
import { useSession } from '~/hooks/useSession';
import { loginWithGitHub } from '~/lib/appwrite';

export function DashboardPage() {
  const session = useSession();
  const navigate = useNavigate();
  const analysis = useAnalysis(session.data?.githubToken);

  useEffect(() => {
    if (!session.isLoading && !session.data) {
      navigate('/', { replace: true });
    }
  }, [session.isLoading, session.data, navigate]);

  if (session.isLoading || !session.data) {
    return (
      <AppShell>
        <div className="grid place-items-center py-32">
          <Spinner label="Checking your session…" />
        </div>
      </AppShell>
    );
  }

  const result = analysis.data;
  const viewer = result?.viewer;

  return (
    <AppShell githubLogin={viewer?.login} avatarUrl={viewer?.avatarUrl}>
      <div className="mx-auto max-w-6xl px-6 py-10 flex flex-col gap-8">
        {analysis.isLoading && (
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

        {analysis.error && (
          <EmptyState
            title="Could not load your GitHub data"
            description={(analysis.error as Error).message}
            action={
              <div className="flex gap-3">
                <Button onClick={() => analysis.refetch()}>Retry</Button>
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
