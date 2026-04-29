import { useEffect } from 'react';
import { useNavigate } from 'react-router';
import { Spinner } from '~/components/ui/Spinner';
import { useSession } from '~/hooks/useSession';

export function CallbackPage() {
  const navigate = useNavigate();
  const session = useSession();

  useEffect(() => {
    if (session.isLoading) return;
    if (session.data) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/?auth=failed', { replace: true });
    }
  }, [session.isLoading, session.data, navigate]);

  return (
    <div className="min-h-full grid place-items-center">
      <Spinner label="Finalising your session…" />
    </div>
  );
}
