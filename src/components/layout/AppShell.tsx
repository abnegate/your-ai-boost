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
      <footer className="border-t border-[var(--color-border)] py-6 text-center text-xs text-[var(--color-muted)]">
        Last 2 years of commit history · Data stays in your browser · Built with Appwrite ·{' '}
        <a
          href="https://github.com/abnegate/your-ai-boost"
          className="text-[var(--color-text)] hover:text-[var(--color-accent)] transition-colors"
        >
          Source
        </a>
      </footer>
    </div>
  );
}
