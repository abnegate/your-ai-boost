import type { ReactNode } from 'react';
import { Header } from '~/components/layout/Header';
import { Logo } from '~/components/ui/Logo';

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
      <footer className="mt-24 border-t border-[var(--color-divider)]">
        <div className="mx-auto max-w-[1240px] px-6 py-8 flex flex-wrap items-center justify-between gap-6 text-[12px] text-[var(--color-muted)]">
          <div className="flex items-center gap-4">
            <Logo />
            <span className="hidden sm:inline text-[var(--color-muted)]">
              Measure your AI velocity.
            </span>
          </div>
          <nav className="flex items-center gap-5">
            <a
              href="https://github.com/abnegate/your-ai-boost"
              className="hover:text-[var(--color-text-strong)] transition-colors"
            >
              Source
            </a>
            <a
              href="https://appwrite.io"
              className="hover:text-[var(--color-text-strong)] transition-colors"
            >
              Built on Appwrite
            </a>
            <span className="text-[var(--color-muted)]">Read-only · token stays local</span>
          </nav>
        </div>
      </footer>
    </div>
  );
}
