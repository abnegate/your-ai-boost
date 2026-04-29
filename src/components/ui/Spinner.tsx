import { cn } from '~/lib/cn';

type SpinnerProps = {
  readonly size?: number;
  readonly className?: string;
  readonly label?: string;
};

export function Spinner({ size = 18, className, label }: SpinnerProps) {
  return (
    <span className={cn('inline-flex items-center gap-2 text-[var(--color-muted)]', className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        className="animate-spin"
        aria-hidden
      >
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeOpacity="0.2" strokeWidth="2" />
        <path
          d="M21 12a9 9 0 0 0-9-9"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
      {label && <span className="text-sm">{label}</span>}
    </span>
  );
}
