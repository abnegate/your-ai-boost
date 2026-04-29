import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Logo } from '~/components/ui/Logo';
import { logout } from '~/lib/appwrite';

type HeaderProps = {
  readonly githubLogin?: string | undefined;
  readonly avatarUrl?: string | undefined;
};

const isoDate = (d = new Date()): string => d.toISOString().slice(0, 10);

export function Header({ githubLogin, avatarUrl }: HeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function onLogout(): Promise<void> {
    try {
      await logout();
    } catch (error) {
      console.warn('logout failed', error);
    }
    queryClient.clear();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur-md bg-[color-mix(in_oklab,var(--color-canvas)_88%,transparent)] border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1280px] px-6">
        <div className="flex items-center justify-between gap-6 h-14">
          <Logo />

          {/* Center marquee — date / coordinates / edition */}
          <div className="hidden md:flex items-center gap-5 font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] tabular-nums">
            <span>filed&nbsp;·&nbsp;{isoDate()}</span>
            <span className="hatch h-[10px] w-16" aria-hidden />
            <span>edition&nbsp;·&nbsp;NZ&#8202;/&#8202;AKL</span>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-4">
            {githubLogin ? (
              <>
                <div className="flex items-center gap-2 pl-3 pr-1 py-1 border border-[var(--color-border-strong)] rounded-[var(--radius-sm)]">
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-5 rounded-[2px] border border-[var(--color-border-strong)]"
                    />
                  )}
                  <span className="font-mono text-[11px] text-[var(--color-text)]">
                    @{githubLogin}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onLogout}
                  className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)] hover:text-[var(--color-paper)] transition-colors"
                >
                  Sign out ↗
                </button>
              </>
            ) : (
              <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[var(--color-muted)]">
                Unidentified
              </span>
            )}
          </div>
        </div>
        {/* Hairline ticker bar */}
        <div className="hatch h-[3px] -mb-px" aria-hidden />
      </div>
    </header>
  );
}
