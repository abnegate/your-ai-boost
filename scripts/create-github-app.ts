// Programmatically create a GitHub App via the manifest flow.
// You click "Create" once in the browser; this script captures the credentials.
//
// Usage: bun run scripts/create-github-app.ts

const port = Number(process.env.PORT ?? 8765);
const callbackPath = '/callback';
const state = crypto.randomUUID();

const appwriteEndpoint = process.env.PUBLIC_APPWRITE_ENDPOINT ?? 'https://syd.cloud.appwrite.io/v1';
const appwriteProjectId = process.env.PUBLIC_APPWRITE_PROJECT_ID ?? '69f167e7001144ec353a';
const appName = process.env.GH_APP_NAME ?? 'your AI boost';
const homepageUrl = process.env.GH_APP_HOMEPAGE ?? 'https://your-ai-boost.appwrite.network';

const appwriteOAuthCallback = `${appwriteEndpoint}/account/sessions/oauth2/callback/github/${appwriteProjectId}`;

const manifest = {
  name: appName,
  url: homepageUrl,
  description:
    'Counts AI-marked commits in your history and computes how many x faster AI made you. Read-only contents access.',
  hook_attributes: { active: false, url: 'https://example.com/unused' },
  redirect_url: `http://localhost:${port}${callbackPath}`,
  callback_urls: [appwriteOAuthCallback],
  setup_url: homepageUrl,
  public: true,
  default_permissions: {
    // Repository permissions
    contents: 'read', // commit messages, files
    metadata: 'read', // basic repo info (always granted)
    // Account permissions
    email_addresses: 'read', // Appwrite reads the primary email after OAuth
  },
  default_events: [],
  request_oauth_on_install: true,
};

const formPage = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Create GitHub App — your AI boost</title>
    <style>
      :root { color-scheme: dark; }
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        background: #070b14;
        color: #d8e1f4;
        font: 15px/1.55 system-ui, -apple-system, "Segoe UI", sans-serif;
      }
      .card {
        max-width: 520px;
        padding: 32px;
        background: #0c1322;
        border: 1px solid #1e2a45;
        border-radius: 20px;
      }
      h1 { margin: 0 0 12px; font-size: 22px; color: #f5f8ff; }
      p  { margin: 0 0 20px; color: #9aa7c7; }
      ul { margin: 0 0 24px; padding-left: 20px; color: #d8e1f4; }
      li { margin-bottom: 4px; }
      button {
        font: inherit;
        font-weight: 600;
        background: #5a8cff;
        color: #f5f8ff;
        border: 0;
        border-radius: 12px;
        padding: 12px 20px;
        cursor: pointer;
      }
      button:hover { background: #7aa2ff; }
      code { background: #16213a; padding: 2px 6px; border-radius: 4px; font-size: 13px; }
    </style>
  </head>
  <body>
    <main class="card">
      <h1>Create GitHub App</h1>
      <p>Clicking the button posts the manifest to GitHub. You'll see GitHub's confirmation page, click <strong>Create GitHub App for &lt;your-account&gt;</strong>, and you'll be redirected back here.</p>
      <p>Permissions requested:</p>
      <ul>
        <li><strong>Contents: read</strong> — read commit messages and metadata</li>
        <li><strong>Metadata: read</strong> — basic repo info (always granted)</li>
      </ul>
      <p>No write access. No issues, PRs, settings, webhooks, or deploy keys.</p>
      <form id="f" method="post" action="https://github.com/settings/apps/new?state=${state}">
        <input type="hidden" name="manifest" value='${JSON.stringify(manifest).replace(/'/g, '&#39;').replace(/"/g, '&quot;')}'>
        <button type="submit">Create on GitHub →</button>
      </form>
    </main>
  </body>
</html>`;

let receivedCode: ((value: string) => void) | null = null;
const codePromise = new Promise<string>((resolve) => {
  receivedCode = resolve;
});

const server = Bun.serve({
  port,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === '/') {
      return new Response(formPage, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    if (url.pathname === callbackPath) {
      const code = url.searchParams.get('code');
      const stateParam = url.searchParams.get('state');
      if (stateParam !== state) {
        return new Response('state mismatch — please re-run the script', { status: 400 });
      }
      if (!code) return new Response('missing code in callback', { status: 400 });
      receivedCode?.(code);
      const done = `<!doctype html><html><body style="background:#070b14;color:#d8e1f4;font:16px/1.5 system-ui;padding:48px;text-align:center"><h1 style="color:#3fd9a3">App created.</h1><p>Switch back to your terminal — credentials are printed there. You can close this tab.</p></body></html>`;
      return new Response(done, { headers: { 'content-type': 'text/html; charset=utf-8' } });
    }
    return new Response('Not found', { status: 404 });
  },
});

console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(` Listening on http://localhost:${port}/`);
console.log(' Opening browser…');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
Bun.spawn(['open', `http://localhost:${port}/`]);

const code = await codePromise;
console.log('\n[1/2] Code received from GitHub. Exchanging for credentials…');

const conversion = await fetch(`https://api.github.com/app-manifests/${code}/conversions`, {
  method: 'POST',
  headers: {
    accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
  },
});

if (!conversion.ok) {
  console.error(`\nGitHub returned ${conversion.status}:`);
  console.error(await conversion.text());
  await server.stop(true);
  process.exit(1);
}

type ConversionResponse = {
  id: number;
  name: string;
  html_url: string;
  client_id: string;
  client_secret: string;
  webhook_secret: string | null;
  pem: string;
};

const data = (await conversion.json()) as ConversionResponse;

console.log('[2/2] Credentials received.\n');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(' GitHub App credentials');
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
console.log(` name           ${data.name}`);
console.log(` app_id         ${data.id}`);
console.log(` html_url       ${data.html_url}`);
console.log(` client_id      ${data.client_id}`);
console.log(` client_secret  ${data.client_secret}`);
console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
console.log('Next steps:');
console.log(`  1. Install the app on your GitHub account:`);
console.log(`       ${data.html_url}/installations/new`);
console.log(`     Pick "All repositories" so the AI marker scan covers everything.`);
console.log('');
console.log(`  2. Paste the credentials into Appwrite (GitHub provider):`);
console.log(`       ${appwriteEndpoint.replace('/v1', '').replace('https://', 'https://cloud.')}`);
console.log(`         App ID     → ${data.client_id}`);
console.log(`         App Secret → ${data.client_secret}`);
console.log('');

await Bun.write(
  `.github-app-credentials.json`,
  JSON.stringify(
    {
      name: data.name,
      app_id: data.id,
      html_url: data.html_url,
      client_id: data.client_id,
      client_secret: data.client_secret,
      webhook_secret: data.webhook_secret,
      pem: data.pem,
    },
    null,
    2,
  ),
);
console.log('Saved full credentials (including PEM private key) to .github-app-credentials.json');
console.log('That file is gitignored — keep it private.\n');

await server.stop(true);
