import { useQuery } from '@tanstack/react-query';
import type { Models } from 'appwrite';
import { account } from '~/lib/appwrite';

export type SessionData = {
  readonly session: Models.Session;
  readonly githubToken: string;
};

async function fetchSession(): Promise<SessionData | null> {
  try {
    const session = await account.getSession({ sessionId: 'current' });
    if (session.provider !== 'github' || !session.providerAccessToken) return null;
    return { session, githubToken: session.providerAccessToken };
  } catch {
    return null;
  }
}

export function useSession() {
  return useQuery({
    queryKey: ['appwrite', 'session'],
    queryFn: fetchSession,
    staleTime: 60 * 1000,
  });
}
