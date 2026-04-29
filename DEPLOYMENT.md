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
pnpm install
pnpm build
appwrite push sites   # creates / updates the site declared in appwrite.config.json
```

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

## Configure GitHub OAuth provider

1. **Project Settings → Auth → Settings → OAuth2 Providers → GitHub**
2. Create a GitHub OAuth App (`https://github.com/settings/developers`).
   - Authorization callback URL: copy the value Appwrite shows in the GitHub provider panel (looks like `https://syd.cloud.appwrite.io/v1/account/sessions/oauth2/callback/github/69f167e7001144ec353a`).
3. Paste the GitHub App ID and Secret into the Appwrite GitHub provider, enable it.

## Build details

- Framework: React (Vite)
- Node runtime: `node-22`
- Install: `pnpm install`
- Build: `pnpm build`
- Output: `./dist`
- Adapter: `static` (single-page-app fallback to `index.html`)
