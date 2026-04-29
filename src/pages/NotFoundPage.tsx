import { Link } from 'react-router';
import { AppShell } from '~/components/layout/AppShell';

export function NotFoundPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1240px] px-6 py-32 flex flex-col items-start gap-6">
        <span className="text-[12px] font-mono tabular-nums text-[var(--color-accent)]">404</span>
        <h1 className="text-[clamp(56px,12vw,144px)] font-semibold leading-[0.95] tracking-[-0.04em] text-[var(--color-text-strong)]">
          Page not found.
        </h1>
        <p className="text-[15px] text-[var(--color-muted-2)] max-w-[55ch] leading-relaxed">
          The route you tried to reach doesn’t map to anything here. Could be a stale link, a typo,
          or a page that never existed.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 h-10 px-4 rounded-[var(--radius-md)] border border-[var(--color-border)] hover:border-[var(--color-border-strong)] hover:bg-[var(--color-surface)] text-[14px] text-[var(--color-text-strong)] transition-colors"
        >
          ← Back home
        </Link>
      </div>
    </AppShell>
  );
}
