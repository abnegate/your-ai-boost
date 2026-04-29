import { cn } from '~/lib/cn';

type LogoProps = {
  readonly className?: string;
  readonly compact?: boolean;
};

export function Logo({ className, compact }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-center gap-2.5 font-semibold tracking-tight', className)}
    >
      <span className="size-7 rounded-[10px] bg-[var(--color-surface-2)] border border-[var(--color-border-strong)] grid place-items-center">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path
            d="M4 18 L10 6 L14 14 L20 4"
            stroke="var(--color-accent)"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="20" cy="4" r="1.8" fill="var(--color-accent)" />
        </svg>
      </span>
      {!compact && (
        <span className="text-[15px] text-[var(--color-text-strong)]">
          your <span className="text-[var(--color-accent)]">AI</span> boost
        </span>
      )}
    </span>
  );
}
