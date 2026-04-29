import { z } from 'zod';

const schema = z.object({
  VITE_APPWRITE_ENDPOINT: z.string().url(),
  VITE_APPWRITE_PROJECT_ID: z.string().min(1),
});

const parsed = schema.safeParse(import.meta.env);

if (!parsed.success) {
  console.error('Invalid environment variables', parsed.error.flatten().fieldErrors);
  throw new Error('Invalid environment variables. See console for details.');
}

export const env = Object.freeze({
  appwriteEndpoint: parsed.data.VITE_APPWRITE_ENDPOINT,
  appwriteProjectId: parsed.data.VITE_APPWRITE_PROJECT_ID,
  redirectSuccess: `${window.location.origin}/callback`,
  redirectFailure: `${window.location.origin}/?auth=failed`,
});
