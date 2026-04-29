import { Account, Client, OAuthProvider } from 'appwrite';
import { env } from '~/lib/env';

export const appwriteClient = new Client()
  .setEndpoint(env.appwriteEndpoint)
  .setProject(env.appwriteProjectId);

export const account = new Account(appwriteClient);

// Minimal scopes: we only read public commit messages (via /search/commits) and
// the viewer's own contribution graph (via GraphQL `viewer.contributionsCollection`).
// Private repo commits are intentionally out of scope — that would require `repo`,
// which grants read+write to all repo data. read:user is enough for profile info
// and unlocks higher API rate limits than fully unauthenticated requests.
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
