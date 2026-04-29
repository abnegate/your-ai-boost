# your AI boost

How many `x` faster has AI made you? Connect GitHub, get a multiplier on your monthly commit output and a breakdown of your AI coding patterns.

## Screenshots

Every screen state below was captured by Playwright against the actual built app. Source under [`docs/screenshots/`](./docs/screenshots).

### Landing

![Landing — desktop](./docs/screenshots/01-landing-desktop.png)
![Landing — mobile](./docs/screenshots/02-landing-mobile.png)
![Landing — auth failed](./docs/screenshots/03-landing-auth-failed.png)

### Dashboard

![Dashboard — full results](./docs/screenshots/07-dashboard-results.png)
![Dashboard — mobile](./docs/screenshots/08-dashboard-results-mobile.png)
![Dashboard — loading](./docs/screenshots/04-dashboard-loading.png)
![Dashboard — empty (no AI markers)](./docs/screenshots/05-dashboard-empty.png)
![Dashboard — error](./docs/screenshots/06-dashboard-error.png)

### 404

![404](./docs/screenshots/09-not-found.png)

## Stack

- **Runtime / package manager / bundler / test runner:** Bun 1.3
- **UI:** React 19 with `react-router` 7, TanStack Query 5, Recharts 3
- **Styling:** Tailwind CSS v4 (CSS-first `@theme` tokens, compiled via `@tailwindcss/cli`)
- **Auth:** Appwrite Web SDK 25 → GitHub OAuth (`read:user` only — no `repo` scope, we don't read your code)
- **GitHub data:** Octokit (REST + GraphQL)
- **TypeScript:** strict, `verbatimModuleSyntax`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `erasableSyntaxOnly`
- **Tests:** `bun test` against pure-domain modules (analyzer + markers + format) — 25 tests, 84 expectations

## Local development

```bash
bun install
cp .env.example .env
bun run dev
```

Required env (`.env`):

```
PUBLIC_APPWRITE_ENDPOINT=https://syd.cloud.appwrite.io/v1
PUBLIC_APPWRITE_PROJECT_ID=69f167e7001144ec353a
```

`bunfig.toml` exposes any `PUBLIC_*` env var to the client bundle (both dev and build).

### Scripts

| Command | What it does |
| --- | --- |
| `bun run dev` | Bun.serve dev server with HTML routes + Tailwind in `--watch` |
| `bun run build` | Compiles Tailwind, then `Bun.build` produces `dist/` (HTML, JS, CSS, assets) |
| `bun run preview` | Serves `dist/` from a local Bun server |
| `bun test` | Runs all `*.test.ts` via `bun test` |
| `bun run lint` | ESLint flat config (`@eslint/js`, `typescript-eslint`, `react-hooks`) |
| `bun run typecheck` | `tsc --noEmit` |
| `bun run screenshots` | Captures every screen state to `docs/screenshots/` (requires dev server running) |

### Demo mode

The dashboard accepts a `?demo=` query string for screenshots and design review without real auth:

| URL | Renders |
| --- | --- |
| `/dashboard?demo=ready` | Full dashboard with seeded analysis |
| `/dashboard?demo=loading` | Scanning state |
| `/dashboard?demo=empty` | "No AI markers found yet" |
| `/dashboard?demo=error` | Failure card with retry |

## How it works

1. **Sign in with GitHub** via Appwrite OAuth — `read:user` scope only.
2. **Find patient zero**: search the user's **public** commits for canonical AI markers (Claude Code, Copilot, Cursor, Aider, Cline, Codeium/Windsurf, Devin, Sweep, Continue) and pick the earliest.
3. **Compute the multiplier**: average monthly commits before vs. after that date, using `viewer.contributionsCollection` (which counts both public and private contributions toward the daily totals — without granting us access to private code). Result rounded to 1 decimal.
4. **Surface insights**: assistant mix, AI commit share, longest streak, peak hour / weekday, dev-days reclaimed, and the original "patient zero" commit message.

### Why we don't ask for `repo` scope

GitHub's `repo` scope grants **read+write to all repository data** — code, issues, PRs, wikis, settings, webhooks, deploy keys. Asking for that to count commit messages is wildly disproportionate. Instead this app uses `read:user` only:

- Contribution graph (daily counts, public + private) — works because the **viewer** is querying their own data via `viewer.contributionsCollection`.
- AI marker detection — uses `/search/commits` over **public commits only**. Private commits are excluded from marker counts. The numerator may be lower than reality if you commit a lot privately, but the multiplier (which is based on contribution counts, not search results) is unaffected.

All GitHub data is fetched directly from the user's browser using the OAuth access token returned by Appwrite — nothing is persisted server-side by this app.

## Deployment

Deployed via **Appwrite Sites** with GitHub as the source. Push to `main` triggers a build (`bun run build`) and serves `dist/`. See [`DEPLOYMENT.md`](./DEPLOYMENT.md) and [`appwrite.config.json`](./appwrite.config.json) for the full configuration.
