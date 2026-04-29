import { z } from 'zod';

// Public defaults — these values ship in any deployed client bundle anyway
// (the project ID and endpoint are not secrets), so hardcoding them as a
// fallback keeps the app working even if a deploy pipeline forgets to inject
// the env vars. Override either via build-time PUBLIC_* env vars.
const defaults = {
  endpoint: 'https://syd.cloud.appwrite.io/v1',
  projectId: '69f167e7001144ec353a',
} as const;

const schema = z.object({
  PUBLIC_APPWRITE_ENDPOINT: z.string().url(),
  PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1),
});

const parsed = schema.safeParse({
  PUBLIC_APPWRITE_ENDPOINT: process.env.PUBLIC_APPWRITE_ENDPOINT || defaults.endpoint,
  PUBLIC_APPWRITE_PROJECT_ID: process.env.PUBLIC_APPWRITE_PROJECT_ID || defaults.projectId,
});

if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. See console for details.');
}

export const env = Object.freeze({
  appwriteEndpoint: parsed.data.PUBLIC_APPWRITE_ENDPOINT,
  appwriteProjectId: parsed.data.PUBLIC_APPWRITE_PROJECT_ID,
  redirectSuccess: `${window.location.origin}/callback`,
  redirectFailure: `${window.location.origin}/?auth=failed`,
});
