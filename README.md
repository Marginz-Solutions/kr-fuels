# KR Trans Fuels — Monorepo (`kr_fuels`)

Turborepo + pnpm workspaces. One data backend, two front-ends.

```
kr_fuels/
├─ apps/
│  ├─ backend/   # Next.js 16 — API only (app/api/v1/*) + firebase-admin + GCS  → :4000
│  ├─ admin/     # Next.js 16 — admin panel UI (calls backend)                  → :3000
│  └─ user/      # Next.js 16 — public website, SSR (calls backend)             → :3000
└─ packages/
   └─ shared/    # @kr/shared — types, zod validators, design tokens, firebase client, utils
```

`@kr/shared` is the **single source of truth** for cross-app types and validators. It is
consumed as TypeScript source (each app sets `transpilePackages: ["@kr/shared"]`).

## Prerequisites

- Node ≥ 20, **pnpm** (`corepack enable && corepack prepare pnpm@9.15.0 --activate`)

## Setup

```bash
pnpm install
# Create each app's .env.local from its .env.example and fill in real values:
#   apps/backend/.env.local   — Firebase admin service-account secrets
#   apps/admin/.env.local     — NEXT_PUBLIC_API_BASE_URL + Firebase client config
#   apps/user/.env.local      — NEXT_PUBLIC_API_BASE_URL
```

> The repo ships placeholder `.env.local` files only where needed for a green build.
> **Replace them with real Firebase credentials before running against live data.**

## Run

```bash
pnpm dev                      # all apps via turbo
# or individually:
pnpm dev:backend              # :4000
pnpm dev:admin                # :3000
pnpm dev:user                 # :3000
```

## Build / verify

```bash
pnpm build        # turbo build all apps
pnpm typecheck    # tsc --noEmit per app
pnpm lint
```

## Env vars

| App | Key vars |
|---|---|
| backend | `FIREBASE_ADMIN_PROJECT_ID`, `FIREBASE_ADMIN_CLIENT_EMAIL`, `FIREBASE_ADMIN_PRIVATE_KEY`, `FIREBASE_STORAGE_BUCKET`, `FIREBASE_DB`, `ADMIN_ORIGIN`, `USER_ORIGIN`, `COOKIE_DOMAIN` |
| admin | `NEXT_PUBLIC_API_BASE_URL`, `NEXT_PUBLIC_FIREBASE_*`, `COOKIE_DOMAIN` |
| user | `NEXT_PUBLIC_API_BASE_URL` |

See `apps/backend/README.md` for the cross-origin auth / cookie-domain deploy notes.
