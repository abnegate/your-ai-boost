import { Account, Client, OAuthProvider } from 'appwrite';
import { env } from '~/lib/env';

export const appwriteClient = new Client()
  .setEndpoint(env.appwriteEndpoint)
  .setProject(env.appwriteProjectId);

export const account = new Account(appwriteClient);

export const githubScopes = ['read:user', 'user:email', 'repo'] as const;

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
