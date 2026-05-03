# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

## Recipe Archiver — two backends

There are two parallel deployments of the recipe app sharing the same UI design:

- **Replit app** (`artifacts/recipe-archiver` + `artifacts/api-server`): Express + Postgres via drizzle. Schema in `lib/db/src/schema/recipes.ts`; OpenAPI contract in `lib/api-spec/openapi.yaml`. After schema changes: `pnpm --filter @workspace/api-spec run codegen` then `pnpm --filter @workspace/db run push`.
- **GitHub Pages static site** (`github-pages/` → builds to `docs/`): hits Supabase directly using the anon key. Build with `cd github-pages && npm run build`. The Supabase schema must be migrated manually — Replit cannot reach the user's Supabase project.

### Cook field (added 2026-05)

A free-text `cook` column on `recipes` tags who added each recipe. The form's Cook combobox suggests existing names, persists the last value to `localStorage["spencer-cook"]`, and the dashboard exposes a Cook filter pill plus a "★ Just mine" shortcut tied to that local value.

**Supabase migration (run once in the user's Supabase SQL editor):**

```sql
ALTER TABLE recipes ADD COLUMN cook text;
```

Without that, the github-pages site will error on insert/select for the cook column.
