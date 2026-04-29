import { useQuery } from '@tanstack/react-query';
import { account } from '~/lib/appwrite';

export function useAccount() {
  return useQuery({
    queryKey: ['appwrite', 'account'],
    queryFn: async () => {
      try {
        return await account.get();
      } catch {
        return null;
      }
    },
    staleTime: 60 * 1000,
  });
}
