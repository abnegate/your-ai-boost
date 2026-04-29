import { Account, Client, OAuthProvider } from 'appwrite';
import { env } from '~/lib/env';

export const appwriteClient = new Client()
  .setEndpoint(env.appwriteEndpoint)
  .setProject(env.appwriteProjectId);

export const account = new Account(appwriteClient);

// We pair this with a GitHub App (not an OAuth App) on the GitHub side, so
// repo access is granted via the App's `contents: read` permission rather than
// the classic `repo` OAuth scope (which is read+write everything). For GitHub
// Apps the OAuth `scope` param is ignored — permissions come from the App
// definition. read:user is harmless and unlocks slightly higher rate limits.
export const githubScopes = ['read:user'] as const;

export function loginWithGitHub(): void {
  account.createOAuth2Session({
    provider: OAuthProvider.Github,
    success: env.redirectSuccess,
    failure: env.redirectFailure,
    scopes: [...githubScopes],
  });
}

export async function logout(): Promise<void> {
  await account.deleteSession({ sessionId: 'current' });
}
