import { Link } from 'react-router';
import { AppShell } from '~/components/layout/AppShell';
import { Button } from '~/components/ui/Button';

export function NotFoundPage() {
  return (
    <AppShell>
      <div className="mx-auto max-w-md px-6 py-24 text-center flex flex-col items-center gap-6">
        <div className="text-7xl font-semibold tracking-tight text-[var(--color-text-strong)]">
          404
        </div>
        <p className="text-[var(--color-muted)]">No route matches that path.</p>
        <Link to="/">
          <Button>Back to home</Button>
        </Link>
      </div>
    </AppShell>
  );
}
