import type { AnalysisResult } from '~/domain/types';
import { Badge } from '~/components/ui/Badge';
import { formatDate, formatMultiplier, formatNumber } from '~/lib/format';

type BoostHeroProps = {
  readonly result: AnalysisResult;
};

function multiplierVerdict(multiplier: number): string {
  if (multiplier === 0) return 'Not enough data — keep shipping.';
  if (multiplier < 0.85) return 'AI made you more thoughtful, less prolific.';
  if (multiplier < 1.1) return 'About the same — maybe AI is doing the boring parts.';
  if (multiplier < 1.5) return 'A meaningful lift in your output.';
  if (multiplier < 2.5) return 'Sustained step-change. Receipts attached.';
  if (multiplier < 5) return 'You are shipping like a small team.';
  return 'You are operating in a different gear entirely.';
}

export function BoostHero({ result }: BoostHeroProps) {
  const formattedMultiplier = formatMultiplier(result.multiplier);
  const verdict = multiplierVerdict(result.multiplier);

  return (
    <section className="relative overflow-hidden rounded-[var(--radius-xl)] border border-[var(--color-border-strong)] bg-[var(--color-surface)] p-8 sm:p-12">
      <div className="absolute inset-0 grid-bg opacity-40 pointer-events-none" aria-hidden />
      <div className="relative flex flex-col gap-6">
        <div className="flex flex-wrap items-center gap-2">
          <Badge tone="accent" dot>
            AI co-pilot detected
          </Badge>
          {result.first && (
            <Badge tone="neutral">
              Started {formatDate(result.first.committedAt)} · {result.first.repository}
            </Badge>
          )}
        </div>

        <div className="flex flex-col gap-2">
          <h1 className="text-[15px] font-medium text-[var(--color-muted)] uppercase tracking-[0.18em]">
            AI has made you a
          </h1>
          <p className="text-[clamp(72px,14vw,168px)] leading-none font-semibold tracking-[-0.04em] text-[var(--color-text-strong)] tabular-nums">
            {formattedMultiplier}
          </p>
          <p className="text-lg sm:text-xl text-[var(--color-text)] max-w-2xl">{verdict}</p>
        </div>

        <dl className="grid sm:grid-cols-3 gap-4 mt-2 max-w-3xl">
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Pre-AI monthly average
            </dt>
            <dd className="text-xl font-semibold text-[var(--color-text-strong)] tabular-nums">
              {formatNumber(Math.round(result.preMonthlyAverage))} commits
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              Post-AI monthly average
            </dt>
            <dd className="text-xl font-semibold text-[var(--color-text-strong)] tabular-nums">
              {formatNumber(Math.round(result.postMonthlyAverage))} commits
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-xs uppercase tracking-[0.12em] text-[var(--color-muted)]">
              AI-marked commits
            </dt>
            <dd className="text-xl font-semibold text-[var(--color-text-strong)] tabular-nums">
              {formatNumber(result.totalAiCommits)}
            </dd>
          </div>
        </dl>
      </div>
    </section>
  );
}
