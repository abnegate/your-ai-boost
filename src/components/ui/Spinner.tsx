import { cn } from '~/lib/cn';

type SpinnerProps = {
  readonly size?: number;
  readonly className?: string;
  readonly label?: string;
};

export function Spinner({ size = 18, className, label }: SpinnerProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-3 text-[var(--color-muted)] font-mono text-[11px] tracking-[0.18em] uppercase',
        className,
      )}
    >
      <svg width={size} height={size} viewBox="0 0 24 24" className="animate-spin" aria-hidden>
        <circle
          cx="12"
          cy="12"
          r="9"
          fill="none"
          stroke="currentColor"
          strokeOpacity="0.2"
          strokeWidth="1.5"
        />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          strokeLinecap="round"
        />
      </svg>
      {label && <span>{label}</span>}
    </span>
  );
}
