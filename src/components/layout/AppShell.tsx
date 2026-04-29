import type { ReactNode } from 'react';
import { Header } from '~/components/layout/Header';

type AppShellProps = {
  readonly children: ReactNode;
  readonly githubLogin?: string | undefined;
  readonly avatarUrl?: string | undefined;
};

export function AppShell({ children, githubLogin, avatarUrl }: AppShellProps) {
  return (
    <div className="min-h-full flex flex-col">
      <Header githubLogin={githubLogin} avatarUrl={avatarUrl} />
      <main className="flex-1">{children}</main>
      <footer className="mt-24 border-t border-[var(--color-rule)]">
        <div className="mx-auto max-w-[1280px] px-6 py-10 grid grid-cols-12 gap-6 text-[12px] leading-relaxed text-[var(--color-muted)]">
          <div className="col-span-12 md:col-span-6 flex flex-col gap-2">
            <p className="display italic text-[18px] text-[var(--color-paper)] leading-tight">
              A small instrument for measuring how much faster you ship since AI joined the
              workshop.
            </p>
            <p className="font-mono text-[10px] tracking-[0.18em] uppercase text-[var(--color-muted)]">
              ◇ Compiled with Bun · Set in Instrument Serif &amp; Geist
            </p>
          </div>
          <div className="col-span-6 md:col-span-3">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] pb-2 mb-3 border-b border-[var(--color-border)]">
              Provenance
            </div>
            <ul className="space-y-1.5">
              <li>Last 2y of commit history</li>
              <li>Read-only GitHub App</li>
              <li>Token never leaves your browser</li>
            </ul>
          </div>
          <div className="col-span-6 md:col-span-3">
            <div className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] pb-2 mb-3 border-b border-[var(--color-border)]">
              Off-press
            </div>
            <ul className="space-y-1.5">
              <li>
                <a
                  href="https://github.com/abnegate/your-ai-boost"
                  className="hover:text-[var(--color-paper)] transition-colors"
                >
                  Source on GitHub ↗
                </a>
              </li>
              <li>
                <a
                  href="https://appwrite.io"
                  className="hover:text-[var(--color-paper)] transition-colors"
                >
                  Hosted on Appwrite Sites ↗
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
