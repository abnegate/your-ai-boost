import type { AnalysisResult } from '~/domain/types';
import { formatDate, formatMultiplier, formatNumber } from '~/lib/format';

type BoostHeroProps = {
  readonly result: AnalysisResult;
};

function multiplierVerdict(multiplier: number): string {
  if (multiplier === 0) return 'Not enough data — keep shipping.';
  if (multiplier < 0.85) return 'AI made you more thoughtful, less prolific.';
  if (multiplier < 1.1) return 'About the same. Maybe AI is doing the boring parts.';
  if (multiplier < 1.5) return 'A meaningful lift in your output.';
  if (multiplier < 2.5) return 'Sustained step-change. Receipts attached.';
  if (multiplier < 5) return 'You are shipping like a small team.';
  return 'You are operating in a different gear entirely.';
}

export function BoostHero({ result }: BoostHeroProps) {
  const formattedMultiplier = formatMultiplier(result.multiplier);
  const verdict = multiplierVerdict(result.multiplier);

  return (
    <section className="surface edge-light overflow-hidden">
      <div className="relative ambient px-6 sm:px-10 pt-12 pb-10">
        <div className="grid grid-cols-12 gap-6 items-end">
          <div className="col-span-12 md:col-span-7 flex flex-col gap-5">
            <div className="text-[12px] font-medium text-[var(--color-muted-2)] tracking-tight">
              AI has made you a
            </div>
            <h1
              className="font-semibold tracking-[-0.055em] leading-[0.86] text-[var(--color-text-strong)] tabular-nums text-[clamp(112px,20vw,232px)]"
              aria-label={`AI multiplier: ${formattedMultiplier}`}
            >
              {formattedMultiplier}
              <span className="text-[var(--color-accent)]">×</span>
            </h1>
            <p className="text-[18px] text-[var(--color-text)] leading-snug max-w-[44ch]">
              {verdict}
            </p>
          </div>
          <div className="col-span-12 md:col-span-5 md:pl-6 md:border-l border-[var(--color-divider)] flex flex-col gap-3 text-[12px] text-[var(--color-muted-2)]">
            <div className="flex items-baseline justify-between">
              <span>Method</span>
              <span className="text-[var(--color-text)]">commits / month, mean</span>
            </div>
            <div className="flex items-baseline justify-between">
              <span>Window</span>
              <span className="text-[var(--color-text)]">pre vs. post AI · last 2y of search</span>
            </div>
            {result.first && (
              <div className="flex items-baseline justify-between">
                <span>Patient zero</span>
                <a
                  href={result.first.htmlUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors tabular-nums"
                >
                  {formatDate(result.first.committedAt)}
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
      <dl className="grid grid-cols-1 sm:grid-cols-3 border-t border-[var(--color-divider)]">
        <Vital
          label="Pre-AI"
          value={formatNumber(Math.round(result.preMonthlyAverage))}
          unit="commits / month"
        />
        <Vital
          label="Post-AI"
          value={formatNumber(Math.round(result.postMonthlyAverage))}
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
    <div className="flex flex-col gap-2 px-6 py-5 border-b sm:border-b-0 sm:border-r border-[var(--color-divider)] last:border-b-0 sm:last:border-r-0">
      <dt className="text-[12px] font-medium text-[var(--color-muted-2)] tracking-tight">
        {label}
      </dt>
      <dd className="flex items-baseline gap-2">
        <span
          className={`text-[28px] font-semibold tabular-nums tracking-[-0.02em] ${
            accent ? 'text-[var(--color-accent-hover)]' : 'text-[var(--color-text-strong)]'
          }`}
        >
          {value}
        </span>
        <span className="text-[12px] text-[var(--color-muted)]">{unit}</span>
      </dd>
    </div>
  );
}
