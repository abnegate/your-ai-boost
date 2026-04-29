# Deployment

`appwrite.config.json` declares an Appwrite Site named `your-ai-boost` for project `69f167e7001144ec353a` on `https://syd.cloud.appwrite.io/v1`.

## One-time CLI setup

```bash
appwrite client \
  --endpoint https://syd.cloud.appwrite.io/v1 \
  --project-id 69f167e7001144ec353a

appwrite login   # interactive — paste credentials for the cloud account that owns the project
```

## Push the site definition + initial deployment

```bash
bun install
bun run build
appwrite push sites --with-variables   # --with-variables uploads the `vars` array; without it, env is empty
```

`--with-variables` is required to push the entries under `sites[].vars`. Without it the build runs with no env, and although `src/lib/env.ts` falls back to public defaults baked into the bundle, you'll silently miss any per-environment override.

## Wire GitHub as the deployment source

After `appwrite push sites` creates the site:

1. Open the site in the Appwrite console: **Project → Sites → your-ai-boost → Settings → Git**
2. Connect the GitHub repo (`abnegate/your-ai-boost`).
3. Set the production branch to `main`. Appwrite installs its GitHub App and from then on every push to `main` triggers a build and atomic deploy.

If you prefer to wire the connection via the CLI in one shot, you need the GitHub App `installationId` and the GitHub repo's numeric `providerRepositoryId`. With both in hand:

```bash
appwrite sites update \
  --site-id your-ai-boost \
  --installation-id <YOUR_INSTALLATION_ID> \
  --provider-repository-id <REPO_ID> \
  --provider-branch main \
  --provider-silent-mode false
```

The first interactive console connect is usually faster than chasing those IDs.

## Add `*.appwrite.network` (and your custom domain) as a Web platform

Appwrite OAuth requires every origin that calls `account.createOAuth2Session` to be on the project's platform allowlist:

1. **Project Settings → Platforms → Add Platform → Web**
2. Add the site origin (e.g. `https://your-ai-boost.appwrite.network`) and `http://localhost:5173` for local dev.

## Configure GitHub OAuth provider (using a GitHub App)

We deliberately use a GitHub **App** (not an OAuth App) so we can request `contents: read` only — read-only commit access — instead of the classic OAuth `repo` scope which is read+write everything.

```bash
bun run create-github-app
```

That script:
1. Spins up `http://localhost:8765/`.
2. Opens it in your browser. You click **Create on GitHub →**, GitHub shows the manifest summary, you click **Create GitHub App for &lt;account&gt;**.
3. GitHub redirects back to `localhost:8765/callback?code=…`.
4. Script exchanges the code for credentials via `POST /app-manifests/{code}/conversions`.
5. Prints the `client_id` / `client_secret`, and saves the full payload (including the PEM private key) to `.github-app-credentials.json` (gitignored).

Then:
- **Install the app on your account** at the install URL the script prints (`https://github.com/apps/<name>/installations/new`). Pick **All repositories** so the AI marker scan covers everything.
- **In Appwrite Console → Auth → Settings → OAuth2 Providers → GitHub:** paste the `client_id` into App ID and `client_secret` into App Secret, enable it.

## Build details

- Framework: React (Bun bundler — `Bun.build` with HTML entrypoint)
- Build runtime: `bun-1.3` (Appwrite Sites runtime)
- Install: `bun install`
- Build: `bun run build`
- Output: `./dist`
- Adapter: `static` (single-page-app fallback to `index.html`)
