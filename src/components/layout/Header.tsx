import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Logo } from '~/components/ui/Logo';
import { logout } from '~/lib/appwrite';

type HeaderProps = {
  readonly githubLogin?: string | undefined;
  readonly avatarUrl?: string | undefined;
};

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
    <header className="sticky top-0 z-30 backdrop-blur-xl bg-[color-mix(in_oklab,var(--color-bg)_75%,transparent)] border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-[1240px] px-6">
        <div className="flex items-center justify-between gap-6 h-12">
          <Logo />
          <div className="flex items-center gap-2">
            {githubLogin ? (
              <>
                <a
                  href={`https://github.com/${githubLogin}`}
                  target="_blank"
                  rel="noreferrer"
                  className="group flex items-center gap-2 pl-1 pr-2.5 h-7 rounded-[var(--radius-sm)] border border-transparent hover:border-[var(--color-border)] hover:bg-[var(--color-surface)] transition-colors"
                >
                  {avatarUrl && (
                    <img
                      src={avatarUrl}
                      alt=""
                      className="size-5 rounded-full border border-[var(--color-border-strong)]"
                    />
                  )}
                  <span className="text-[12px] text-[var(--color-text)] tracking-tight">
                    {githubLogin}
                  </span>
                </a>
                <span className="h-4 w-px bg-[var(--color-border)] mx-1" aria-hidden />
                <button
                  type="button"
                  onClick={onLogout}
                  className="h-7 px-2.5 text-[12px] text-[var(--color-muted-2)] hover:text-[var(--color-text-strong)] hover:bg-[var(--color-surface)] rounded-[var(--radius-sm)] transition-colors"
                >
                  Sign out
                </button>
              </>
            ) : (
              <span className="text-[12px] text-[var(--color-muted)]">Not signed in</span>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
