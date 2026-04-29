import { useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { Button } from '~/components/ui/Button';
import { Logo } from '~/components/ui/Logo';
import { logout } from '~/lib/appwrite';

type HeaderProps = {
  readonly githubLogin?: string | undefined;
  readonly avatarUrl?: string | undefined;
};

export function Header({ githubLogin, avatarUrl }: HeaderProps) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  async function onLogout() {
    try {
      await logout();
    } catch (error) {
      console.warn('logout failed', error);
    }
    queryClient.clear();
    navigate('/');
  }

  return (
    <header className="sticky top-0 z-30 backdrop-blur bg-[color-mix(in_oklab,var(--color-canvas)_82%,transparent)] border-b border-[var(--color-border)]">
      <div className="mx-auto max-w-6xl flex items-center justify-between px-6 h-16">
        <Logo />
        {githubLogin && (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2.5 text-sm text-[var(--color-text)]">
              {avatarUrl && (
                <img
                  src={avatarUrl}
                  alt=""
                  className="size-7 rounded-full border border-[var(--color-border-strong)]"
                />
              )}
              <span className="hidden sm:inline">{githubLogin}</span>
            </div>
            <Button variant="ghost" size="sm" onClick={onLogout}>
              Sign out
            </Button>
          </div>
        )}
      </div>
    </header>
  );
}
