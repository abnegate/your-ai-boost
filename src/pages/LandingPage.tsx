import { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { AppShell } from '~/components/layout/AppShell';
import { Badge } from '~/components/ui/Badge';
import { Button } from '~/components/ui/Button';
import { Card } from '~/components/ui/Card';
import { useSession } from '~/hooks/useSession';
import { loginWithGitHub } from '~/lib/appwrite';

const features = [
  {
    title: 'Find patient zero',
    body: 'We pinpoint the exact commit where AI joined your workflow — Claude, Copilot, Cursor, Aider, Cline, Codeium, Devin, and more.',
  },
  {
    title: 'Compute the multiplier',
    body: 'Average monthly commits before vs. after that date. One number, rounded to one decimal. Receipts in the chart.',
  },
  {
    title: 'Surface the patterns',
    body: 'When you ship, which assistant you lean on, your AI streak, and an estimate of dev-days reclaimed.',
  },
];

export function LandingPage() {
  const session = useSession();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const authFailed = params.get('auth') === 'failed';

  useEffect(() => {
    if (session.data) navigate('/dashboard', { replace: true });
  }, [session.data, navigate]);

  return (
    <AppShell>
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" aria-hidden />
        <div className="relative mx-auto max-w-5xl px-6 pt-20 pb-24 text-center flex flex-col items-center gap-8">
          <Badge tone="accent" dot>
            v1 · open beta
          </Badge>
          <h1 className="text-[clamp(40px,8vw,84px)] leading-[1.02] font-semibold tracking-[-0.03em] text-[var(--color-text-strong)]">
            How many <span className="text-[var(--color-accent)]">x</span> faster has
            <br /> AI made you?
          </h1>
          <p className="text-lg sm:text-xl text-[var(--color-text)] max-w-2xl">
            Connect GitHub. We trace the first AI-assisted commit in your history, then compute the
            multiplier on your monthly output ever since.
          </p>
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <Button size="lg" onClick={loginWithGitHub} leading={<GitHubMark />}>
              Continue with GitHub
            </Button>
            <span className="text-xs text-[var(--color-muted)]">
              Read-only access · Token never leaves your browser
            </span>
          </div>
          {authFailed && (
            <p className="text-sm text-[var(--color-danger)]">
              Authentication failed. Try again or check your GitHub OAuth permissions.
            </p>
          )}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <div className="grid sm:grid-cols-3 gap-4">
          {features.map((feature) => (
            <Card key={feature.title}>
              <h3 className="text-base font-semibold text-[var(--color-text-strong)] tracking-tight">
                {feature.title}
              </h3>
              <p className="text-sm text-[var(--color-muted)] mt-2 leading-relaxed">
                {feature.body}
              </p>
            </Card>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-6 pb-24">
        <Card padded={false} className="p-8 sm:p-10">
          <h3 className="text-lg font-semibold text-[var(--color-text-strong)] mb-3">
            Markers we look for
          </h3>
          <p className="text-sm text-[var(--color-muted)] max-w-prose">
            We scan commit messages for the canonical co-author trailers and signatures each
            assistant leaves behind:{' '}
            <code className="font-mono text-[var(--color-text)]">Co-Authored-By: Claude</code>,{' '}
            <code className="font-mono text-[var(--color-text)]">Generated with Claude Code</code>,{' '}
            <code className="font-mono text-[var(--color-text)]">
              Co-Authored-By: GitHub Copilot
            </code>
            , Cursor, Aider, Cline, Windsurf, Devin, Sweep, and Continue.
          </p>
        </Card>
      </section>
    </AppShell>
  );
}

function GitHubMark() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 .3a12 12 0 0 0-3.8 23.4c.6.1.8-.3.8-.6v-2.3c-3.3.7-4-1.4-4-1.4-.6-1.4-1.4-1.8-1.4-1.8-1.1-.7.1-.7.1-.7 1.2.1 1.9 1.3 1.9 1.3 1.1 1.9 2.9 1.4 3.6 1.1.1-.8.4-1.4.8-1.7-2.7-.3-5.5-1.3-5.5-6 0-1.3.5-2.4 1.3-3.2-.1-.3-.6-1.6.1-3.4 0 0 1-.3 3.3 1.2a11.5 11.5 0 0 1 6 0c2.3-1.5 3.3-1.2 3.3-1.2.7 1.8.2 3.1.1 3.4.8.8 1.3 1.9 1.3 3.2 0 4.7-2.8 5.7-5.5 6 .4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A12 12 0 0 0 12 .3" />
    </svg>
  );
}
