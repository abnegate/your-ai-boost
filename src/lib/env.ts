import { z } from 'zod';

const schema = z.object({
  PUBLIC_APPWRITE_ENDPOINT: z.string().url(),
  PUBLIC_APPWRITE_PROJECT_ID: z.string().min(1),
});

const parsed = schema.safeParse({
  PUBLIC_APPWRITE_ENDPOINT: process.env.PUBLIC_APPWRITE_ENDPOINT,
  PUBLIC_APPWRITE_PROJECT_ID: process.env.PUBLIC_APPWRITE_PROJECT_ID,
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
