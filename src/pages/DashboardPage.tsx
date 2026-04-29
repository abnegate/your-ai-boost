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
      <div className="mx-auto max-w-[1280px] px-6 py-8 flex flex-col gap-12">
        {isLoading && <ScanningPanel />}

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

            {/* TIMESERIES */}
            <section>
              <SectionRule index="01" title="Timeseries">
                <span>6 mo before patient zero · onward · {result.chartMonths.length} buckets</span>
              </SectionRule>
              <div className="grid grid-cols-12 gap-6 pt-6">
                <div className="col-span-12 lg:col-span-8 panel p-5">
                  <PanelHead
                    eyebrow="Plate I"
                    title="Monthly commits"
                    sub="Dashed line marks patient zero. Green line: AI-marked commits / month."
                  />
                  <MonthlyChart
                    months={result.chartMonths}
                    firstAiMonth={result.first.committedAt.slice(0, 7)}
                  />
                </div>
                <div className="col-span-12 lg:col-span-4 panel p-5">
                  <PanelHead
                    eyebrow="Plate II"
                    title="Assistant mix"
                    sub="Share of AI-marked commits, by tool."
                  />
                  <AssistantBreakdown assistants={result.assistants} />
                </div>
              </div>
            </section>

            {/* FIELD NOTES */}
            <section>
              <SectionRule index="02" title="Field notes">
                <span>derived signals · annotated</span>
              </SectionRule>
              <div className="pt-6">
                <InsightsList result={result} />
              </div>
            </section>

            {/* CADENCE */}
            <section>
              <SectionRule index="03" title="Cadence">
                <span>local time · last {result.totalAiCommits.toLocaleString()} samples</span>
              </SectionRule>
              <div className="grid grid-cols-12 gap-6 pt-6">
                <div className="col-span-12 lg:col-span-7 panel p-5">
                  <PanelHead eyebrow="Plate III" title="Hour of day" sub="Your local time." />
                  <HourHeatmap hours={result.hourHistogram} />
                </div>
                <div className="col-span-12 lg:col-span-5 panel p-5">
                  <PanelHead
                    eyebrow="Plate IV"
                    title="Weekday"
                    sub="AI-marked commits by weekday."
                  />
                  <WeekdayBars counts={result.dayOfWeekHistogram} />
                </div>
              </div>
            </section>
          </>
        )}
      </div>
    </AppShell>
  );
}

function SectionRule({
  index,
  title,
  children,
}: {
  readonly index: string;
  readonly title: string;
  readonly children?: React.ReactNode;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 pt-5 border-t border-[var(--color-rule)]">
      <div className="flex items-baseline gap-3">
        <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-accent)]">
          § {index}
        </span>
        <span className="display italic text-[26px] text-[var(--color-paper)] leading-none">
          {title}
        </span>
      </div>
      {children && (
        <span className="hidden sm:block font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] tabular-nums">
          {children}
        </span>
      )}
    </div>
  );
}

function PanelHead({
  eyebrow,
  title,
  sub,
}: {
  readonly eyebrow: string;
  readonly title: string;
  readonly sub: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 mb-4 pb-3 border-b border-dashed border-[var(--color-border)]">
      <div className="flex flex-col gap-0.5">
        <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-accent)]">
          {eyebrow}
        </span>
        <span className="text-[15px] font-medium text-[var(--color-paper)]">{title}</span>
      </div>
      <span className="hidden md:inline font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)] max-w-[280px] text-right">
        {sub}
      </span>
    </div>
  );
}

function ScanningPanel() {
  return (
    <div className="panel p-6 flex items-center gap-5 crosshairs relative overflow-hidden">
      <span className="ch-tr" />
      <span className="ch-br" />
      <Spinner />
      <div className="flex flex-col gap-1">
        <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-accent)]">
          Now scanning
        </div>
        <div className="text-[14px] text-[var(--color-paper)]">
          Reading your contribution graph and searching for AI markers across two years of commits.
        </div>
      </div>
    </div>
  );
}
