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
      <div className="mx-auto max-w-[1240px] px-6 py-10 flex flex-col gap-12">
        {isLoading && <ScanningPanel />}

        {errorMessage && (
          <EmptyState
            title="Could not load your GitHub data"
            description={errorMessage}
            action={
              <div className="flex gap-2">
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

            <section className="flex flex-col gap-6">
              <SectionHead
                title="Output over time"
                description={`6 months before your first AI commit, onward · ${result.chartMonths.length} buckets`}
              />
              <div className="grid grid-cols-12 gap-3">
                <ChartCard
                  className="col-span-12 lg:col-span-8"
                  title="Monthly commits"
                  hint="All commits area · AI commits line. Vertical guide marks your first AI commit."
                >
                  <MonthlyChart
                    months={result.chartMonths}
                    firstAiMonth={result.first.committedAt.slice(0, 7)}
                  />
                </ChartCard>
                <ChartCard
                  className="col-span-12 lg:col-span-4"
                  title="Assistant mix"
                  hint="Share of AI-marked commits, by tool"
                >
                  <AssistantBreakdown assistants={result.assistants} />
                </ChartCard>
              </div>
            </section>

            <section className="flex flex-col gap-6">
              <SectionHead title="Signals" description="Derived metrics from your AI commit set" />
              <InsightsList result={result} />
            </section>

            <section className="flex flex-col gap-6">
              <SectionHead
                title="Cadence"
                description={`When you ship with AI · local time · ${result.totalAiCommits.toLocaleString()} samples`}
              />
              <div className="grid grid-cols-12 gap-3">
                <ChartCard
                  className="col-span-12 lg:col-span-7"
                  title="Hour of day"
                  hint="Your local timezone"
                >
                  <HourHeatmap hours={result.hourHistogram} />
                </ChartCard>
                <ChartCard
                  className="col-span-12 lg:col-span-5"
                  title="Weekday"
                  hint="AI-marked commits, by day"
                >
                  <WeekdayBars counts={result.dayOfWeekHistogram} />
                </ChartCard>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SectionHead({
  title,
  description,
}: {
  readonly title: string;
  readonly description: string;
}) {
  return (
    <div className="flex items-end justify-between gap-4">
      <div className="flex flex-col gap-1">
        <h2 className="text-[20px] font-semibold text-[var(--color-text-strong)] tracking-tight">
          {title}
        </h2>
        <p className="text-[12px] text-[var(--color-muted)]">{description}</p>
      </div>
    </div>
  );
}

function ChartCard({
  className,
  title,
  hint,
  children,
}: {
  readonly className?: string;
  readonly title: string;
  readonly hint?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div className={`surface edge-light p-5 flex flex-col gap-4 ${className ?? ''}`}>
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-[14px] font-medium text-[var(--color-text-strong)] tracking-tight">
          {title}
        </h3>
        {hint && (
          <span className="text-[11px] text-[var(--color-muted)] text-right max-w-[280px]">
            {hint}
          </span>
        )}
      </div>
      <div className="flex-1">{children}</div>
    </div>
  );
}

function ScanningPanel() {
  return (
    <div className="surface edge-light ambient p-6 flex items-center gap-5">
      <Spinner />
      <div className="flex flex-col gap-1">
        <div className="text-[13px] font-medium text-[var(--color-text-strong)]">
          Scanning your contributions
        </div>
        <div className="text-[12px] text-[var(--color-muted-2)]">
          Reading the contribution graph and searching for AI markers across the last 2 years.
        </div>
      </div>
    </div>
  );
}
