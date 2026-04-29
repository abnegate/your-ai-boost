import { Link } from 'react-router';
import { AppShell } from '~/components/layout/AppShell';

export function NotFoundPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-[1280px] px-6 py-24 grid grid-cols-12 gap-6 items-end border-b border-[var(--color-rule)]">
        <div className="col-span-12 md:col-span-3 flex flex-col gap-1">
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-accent)]">
            Err 404
          </span>
          <span className="font-mono text-[10px] tracking-[0.24em] uppercase text-[var(--color-muted)]">
            Page not in our archive
          </span>
        </div>
        <h1 className="col-span-12 md:col-span-9 display italic text-[clamp(96px,18vw,240px)] leading-[0.9] text-[var(--color-paper)] tracking-[-0.04em]">
          Not <em className="not-italic">found.</em>
        </h1>
      </div>
      <div className="mx-auto max-w-[1280px] px-6 py-10 flex flex-wrap items-baseline justify-between gap-4">
        <p className="text-[15px] text-[var(--color-text)] max-w-prose">
          The route you tried to reach doesn’t map to anything we publish. Could be a stale link, a
          typo, or a page we never wrote.
        </p>
        <Link
          to="/"
          className="font-mono text-[11px] tracking-[0.2em] uppercase text-[var(--color-accent)] hover:text-[var(--color-paper)] transition-colors"
        >
          ← Return to the masthead
        </Link>
      </div>
    </AppShell>
  );
}
