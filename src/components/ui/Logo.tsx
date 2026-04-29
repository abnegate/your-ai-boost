import { cn } from '~/lib/cn';

type LogoProps = {
  readonly className?: string;
};

export function Logo({ className }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2.5 select-none', className)}
      aria-label="Boost — your AI"
    >
      <LogoMark />
      <span className="flex items-baseline gap-1.5">
        <span className="text-[14px] font-semibold text-[var(--color-text-strong)] tracking-tight">
          Boost
        </span>
        <span className="text-[12px] text-[var(--color-muted)]">your AI</span>
      </span>
    </span>
  );
}

function LogoMark() {
  return (
    <span
      aria-hidden
      className="relative inline-flex size-[22px] items-center justify-center rounded-[6px] bg-[var(--color-surface-2)] border border-[var(--color-border-strong)] edge-light"
    >
      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
        <path
          d="M2.6 9.4 6 2.6l3.4 6.8"
          stroke="var(--color-accent)"
          strokeWidth="1.4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M3.9 7h4.2"
          stroke="var(--color-accent)"
          strokeOpacity="0.45"
          strokeWidth="1.4"
          strokeLinecap="round"
        />
      </svg>
    </span>
  );
}
