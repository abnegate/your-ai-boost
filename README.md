# your AI boost

How many `x` faster has AI made you? Connect GitHub, get a multiplier on your monthly commit output and a breakdown of your AI coding patterns.

## Stack

- React 19 + Vite 8 + TypeScript (strict, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`)
- React Router 7, TanStack Query 5
- Tailwind CSS v4 (CSS-first `@theme` tokens)
- Appwrite Web SDK 25 (GitHub OAuth)
- Octokit (GitHub REST + GraphQL)
- Recharts 3 for charts

## Local development

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Required env (`.env`):

```
VITE_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
VITE_APPWRITE_PROJECT_ID=69f167e7001144ec353a
```

## How it works

1. **Sign in with GitHub** via Appwrite OAuth (`read:user`, `user:email`, `repo`).
2. **Find patient zero**: search the user's commits for canonical AI markers (Claude Code, Copilot, Cursor, Aider, Cline, Codeium/Windsurf, Devin, Sweep, Continue) and pick the earliest.
3. **Compute the multiplier**: average monthly commits before vs. after that date, using GitHub's contribution graph (GraphQL `contributionsCollection`). Result rounded to 1 decimal.
4. **Surface insights**: assistant mix, AI commit share, longest streak, peak hour/day, dev-days reclaimed, and the original "patient zero" commit message.

All GitHub data is fetched directly from the user's browser using the OAuth access token returned by Appwrite — nothing is persisted server-side by this app.

## Deployment

Deployed via **Appwrite Sites** with GitHub as the source. Push to `main` triggers a build (`pnpm build`) and serves `dist/`.

```bash
appwrite sites create-deployment --code true --activate true
```

See `appwrite.json` for the full site configuration.
