import { cn } from '~/lib/cn';

type LogoProps = {
  readonly className?: string;
  readonly compact?: boolean;
};

export function Logo({ className, compact }: LogoProps) {
  return (
    <span
      className={cn('inline-flex items-baseline gap-2.5 select-none', className)}
      aria-label="your AI boost"
    >
      <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-muted)]">
        ◆ A.I. Boost
      </span>
      {!compact && (
        <>
          <span className="display italic text-[20px] leading-none text-[var(--color-paper)]">
            yours
          </span>
          <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)]">
            / vol.&nbsp;1
          </span>
        </>
      )}
    </span>
  );
}
