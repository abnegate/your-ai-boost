import type { AnalysisResult } from '~/domain/types';
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
    <section className="relative">
      {/* Specimen tag — top of the hero */}
      <div className="flex items-end justify-between gap-4 pb-3 border-b border-[var(--color-rule)]">
        <div className="flex items-baseline gap-3">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-accent)]">
            Specimen 01 ▎
          </span>
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-muted)]">
            The Multiplier
          </span>
        </div>
        {result.first && (
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)] tabular-nums">
            patient zero · {formatDate(result.first.committedAt)} ·{' '}
            <a
              href={result.first.htmlUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[var(--color-text)] hover:text-[var(--color-accent)]"
            >
              {result.first.repository}
            </a>
          </span>
        )}
      </div>

      <div className="relative crosshairs px-4 sm:px-10 pt-10 pb-12">
        <span className="ch-tr" />
        <span className="ch-br" />
        <div className="absolute inset-0 dot-grid opacity-50 pointer-events-none" aria-hidden />

        <div className="relative grid grid-cols-12 gap-6">
          {/* Left side: prompt label */}
          <div className="col-span-12 sm:col-span-3 flex sm:flex-col gap-2 sm:items-end sm:text-right justify-between sm:justify-start">
            <div>
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                A.I. has made
              </div>
              <div className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                you a
              </div>
            </div>
            <div className="hidden sm:block font-mono text-[10px] text-[var(--color-muted)] tabular-nums">
              ↳ rounded ¹⁄₁₀
            </div>
          </div>

          {/* The number */}
          <div className="col-span-12 sm:col-span-9 flex flex-col gap-6">
            <h1
              className="display ink-rise text-[clamp(96px,22vw,260px)] italic font-normal text-[var(--color-paper)] tracking-[-0.04em]"
              aria-label={`AI multiplier: ${formattedMultiplier}`}
            >
              {formattedMultiplier}
            </h1>
            <p className="display italic text-[clamp(20px,2.4vw,32px)] text-[var(--color-text)] leading-snug max-w-3xl">
              “{verdict}”
            </p>
          </div>
        </div>
      </div>

      {/* Bottom strip — three vital signs in a row, separated by hairlines */}
      <dl className="grid grid-cols-3 border-t border-[var(--color-rule)]">
        <Vital
          label="Pre-AI baseline"
          value={`${formatNumber(Math.round(result.preMonthlyAverage))}`}
          unit="commits / month"
        />
        <Vital
          label="Post-AI cadence"
          value={`${formatNumber(Math.round(result.postMonthlyAverage))}`}
          unit="commits / month"
          accent
        />
        <Vital
          label="Marked AI commits"
          value={formatNumber(result.totalAiCommits)}
          unit={`of ${formatNumber(result.totalCommits)} total`}
        />
      </dl>
    </section>
  );
}

function Vital({
  label,
  value,
  unit,
  accent,
}: {
  readonly label: string;
  readonly value: string;
  readonly unit: string;
  readonly accent?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2 px-4 sm:px-6 py-5 border-r border-[var(--color-rule)] last:border-r-0">
      <dt className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
        {label}
      </dt>
      <dd className="flex items-baseline gap-2">
        <span
          className={`text-2xl sm:text-3xl font-medium tabular-nums tracking-tight ${
            accent ? 'text-[var(--color-accent-ink)]' : 'text-[var(--color-text-strong)]'
          }`}
        >
          {value}
        </span>
        <span className="font-mono text-[10px] tracking-[0.16em] uppercase text-[var(--color-muted)]">
          {unit}
        </span>
      </dd>
    </div>
  );
}
