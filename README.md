# Spencer's Recipe Emporium

A Victorian-aesthetic personal cookbook app for collecting, organizing, and browsing recipes. Paste a URL from any food blog and the scraper strips out the life stories and ads, pulls out ingredients/instructions, and pre-fills a tag-aware form. You can also write recipes by hand. Each recipe gets a randomly-assigned decorative banner with the title curling along a hand-tuned ribbon path.

This repo ships **two parallel deployments** of the same UI:

| Deployment | Backend | Hosted on | Source folder |
|---|---|---|---|
| Replit app | Express + Drizzle hitting Postgres (Supabase) | Replit Autoscale | `artifacts/recipe-archiver` + `artifacts/api-server` |
| GitHub Pages | None — browser talks to Supabase directly via the anon key | GitHub Pages (`/docs`) | `github-pages/` |

Both deployments read and write the **same Supabase `recipes` table**, so a recipe added on one shows up on the other.

> Why two? The GitHub Pages build is the durable archive — it keeps working even if the Replit project disappears, as long as Supabase is alive.

---

## Table of contents

1. [Repo layout](#repo-layout)
2. [Tech stack](#tech-stack)
3. [Database schema](#database-schema)
4. [Supabase setup](#supabase-setup-one-time)
5. [Environment variables](#environment-variables)
6. [Local development](#local-development)
7. [Building and deploying](#building-and-deploying)
8. [How features work](#how-features-work)
9. [Theme system](#theme-system)
10. [Banner system](#banner-system)
11. [Mockup sandbox](#mockup-sandbox--banner-playground)
12. [Common gotchas](#common-gotchas)

---

## Repo layout

```
.
├── artifacts/                          ← Replit-deployable apps
│   ├── recipe-archiver/                  React + Vite frontend (talks to /api)
│   ├── api-server/                       Express 5 backend (Drizzle + Postgres)
│   └── mockup-sandbox/                   Internal preview server for component mockups
│
├── github-pages/                       ← Static build (no server)
│   └── (Vite build → ../docs/)
│
├── docs/                               ← GitHub Pages serves this folder
│
├── lib/                                ← Shared libs (composite TS, declarations emitted)
│   ├── db/                               Drizzle ORM + schema
│   ├── api-spec/                         OpenAPI 3 spec + Orval codegen config
│   ├── api-zod/                          Generated Zod schemas (server-side validation)
│   └── api-client-react/                 Generated React Query hooks (frontend)
│
├── standalone/                         ← Single-package version of the Replit app
│                                          (run with plain npm, no monorepo tooling)
├── scripts/                            ← Repo-level utility scripts
├── pnpm-workspace.yaml                 ← Workspace package discovery + dep catalog
├── tsconfig.json / tsconfig.base.json  ← TS solution + shared strict defaults
└── replit.md                           ← Agent-facing project notes
```

The Replit frontend (`artifacts/recipe-archiver/`) and the GitHub Pages frontend (`github-pages/`) have **near-identical** source trees (same `pages/`, `components/`, `lib/`). The only meaningful difference is `lib/api-client.ts`:

- Replit version uses `@workspace/api-client-react` (generated React Query hooks → Express → Drizzle → Postgres).
- GitHub Pages version uses `@supabase/supabase-js` directly with the anon key.

The biggest divergence is `lib/api-client.ts` (generated React Query hooks vs. direct Supabase calls). Image upload, URL scraping, and the password gate also differ in implementation between the two — the Replit versions go through the API server while the static versions run in-browser, often against public proxies. When you change a UI feature, **edit both** `artifacts/recipe-archiver/src/...` and `github-pages/src/...`.

---

## Tech stack

| Layer | Stack |
|---|---|
| Language | TypeScript 5.9 (strict), Node 24 |
| Monorepo | pnpm workspaces + project references (`tsc --build` for libs, `--noEmit` for leaves) |
| Frontend | React 19, Vite (7 in the Replit apps, 6 in the static site), Tailwind v4, shadcn/ui (Radix primitives), Wouter (router), TanStack Query |
| Backend (Replit) | Express 5, Drizzle ORM, `pino` for logs, `multer` + `sharp` for image upload |
| Backend (GitHub Pages) | None — Supabase JS client directly from browser |
| Database | PostgreSQL hosted on Supabase |
| Image storage | Supabase Storage (public bucket `recipe-images`) |
| API contract | OpenAPI 3.1 → Orval → React Query hooks + Zod schemas |
| Validation | Zod (`zod/v4` on the server, `zod` v3 on the static frontend) |
| Forms | `react-hook-form` + `@hookform/resolvers` |

---

## Database schema

The single `recipes` table (see `lib/db/src/schema/recipes.ts`):

```ts
export const recipesTable = pgTable("recipes", {
  id:           serial("id").primaryKey(),
  title:        text("title").notNull(),
  sourceUrl:    text("source_url"),
  ingredients:  jsonb("ingredients").$type<string[]>().notNull().default([]),
  instructions: jsonb("instructions").$type<string[]>().notNull().default([]),
  imagePath:    text("image_path"),         // Supabase Storage object path
  yields:       text("yields"),
  category:     text("category"),
  notes:        text("notes"),
  totalTime:    text("total_time"),
  prepTime:     text("prep_time"),
  cookTime:     text("cook_time"),
  course:       text("course"),             // facet: Breakfast | Dinner | Dessert | …
  cuisine:      text("cuisine"),            // facet: Italian | Mexican | …
  cook:         text("cook"),               // free text — who added the recipe
  attribute:    jsonb("attribute").$type<string[]>().notNull().default([]), // multi-tag facet
  createdAt:    timestamp("created_at").notNull().defaultNow(),
  updatedAt:    timestamp("updated_at").notNull().defaultNow(),
});
```

Equivalent raw SQL (for manually creating in Supabase):

```sql
CREATE TABLE IF NOT EXISTS recipes (
  id            serial PRIMARY KEY,
  title         text NOT NULL,
  source_url    text,
  ingredients   jsonb NOT NULL DEFAULT '[]'::jsonb,
  instructions  jsonb NOT NULL DEFAULT '[]'::jsonb,
  image_path    text,
  yields        text,
  category      text,
  notes         text,
  total_time    text,
  prep_time     text,
  cook_time     text,
  course        text,
  cuisine       text,
  cook          text,
  attribute     jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at    timestamp NOT NULL DEFAULT now(),
  updated_at    timestamp NOT NULL DEFAULT now()
);
```

For the Replit backend, schema is applied with Drizzle:

```bash
pnpm --filter @workspace/db run push
```

For the GitHub Pages site, **the schema lives in your Supabase project** — Replit can't reach it, so you have to keep it in sync manually. Migration that was applied recently to add `cook`:

```sql
ALTER TABLE recipes ADD COLUMN cook text;
```

---

## Supabase setup (one-time)

You need **one** Supabase project, shared by both deployments.

### 1. Create the project

Sign in at [supabase.com](https://supabase.com), create a project. Note the **Project URL** and the two keys you'll find under **Settings → API**:

- `anon` (public) — safe to ship in browser code
- `service_role` (secret) — never ship; used only by the Replit backend

### 2. Create the table

Run the `CREATE TABLE` above in **SQL Editor**, or let `pnpm --filter @workspace/db run push` create it from Drizzle.

### 3. Create the storage bucket

In **Storage**:
- Bucket name: `recipe-images`
- Public access: **enabled**

### 4. Enable Row Level Security (only required for the GitHub Pages site)

The static site uses the anon key, so RLS policies must allow anon to read/write. Run in **SQL Editor**:

```sql
-- Recipes table
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read"   ON recipes FOR SELECT TO anon USING (true);
CREATE POLICY "Public insert" ON recipes FOR INSERT TO anon WITH CHECK (true);
CREATE POLICY "Public update" ON recipes FOR UPDATE TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Public delete" ON recipes FOR DELETE TO anon USING (true);

-- Storage objects (image upload from browser)
CREATE POLICY "Public upload" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Public read"   ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'recipe-images');
```

> ⚠️ This is "personal cookbook" security — anyone with the URL can write. If you want auth, gate everything behind Supabase Auth and update the policies to `TO authenticated`.

### 5. Future schema changes

Whenever you add or change a column in `lib/db/src/schema/recipes.ts`:

1. Update the Drizzle schema and run `pnpm --filter @workspace/db run push` (this updates the Replit-side DB).
2. **Manually run the equivalent `ALTER TABLE` in Supabase SQL Editor** so the GitHub Pages site sees the column too.
3. Update `github-pages/src/lib/api-client.ts` interfaces and the `rowToRecipe` / `recipeToRow` mappers.
4. Update `lib/api-spec/openapi.yaml` and run `pnpm --filter @workspace/api-spec run codegen`.

---

## Environment variables

### Replit app (set in `.replit` `[userenv.shared]` or as Replit Secrets)

| Variable | Source | Purpose |
|---|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection String (URI, session mode, port 5432) | Drizzle Postgres connection |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL | Used by the API server for image uploads |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → `service_role` key | Server-side image uploads |
| `APP_PASSWORD` | You pick it | Simple password gate on the frontend |
| `PORT` | Set by Replit (`20739` web, `8080` API) | Service port |
| `BASE_PATH` | Set by Replit (`/`) | Frontend base path |
| `SESSION_SECRET` | Random string | Express session signing (optional in dev) |

### GitHub Pages site (`github-pages/.env`)

| Variable | Purpose |
|---|---|
| `VITE_SUPABASE_URL` | Same as `SUPABASE_URL` above |
| `VITE_SUPABASE_ANON_KEY` | Supabase → Settings → API → `anon` public key |
| `VITE_BASE_PATH` | `/recipe-library/` for project pages, or `/` for a custom domain |
| `VITE_APP_PASSWORD` | Optional. If set, the static site shows the same password gate as the Replit app |

---

## Local development

### Replit app

The repo's `.replit` already wires up workflows. From the Replit Run button (or shell):

```bash
# Frontend (Vite at port 20739, proxied at /)
pnpm --filter @workspace/recipe-archiver run dev

# API (Express at port 8080, proxied at /api)
pnpm --filter @workspace/api-server run dev

# Mockup sandbox (component preview server)
pnpm --filter @workspace/mockup-sandbox run dev
```

Or use the registered workflows (`artifacts/recipe-archiver: web`, `artifacts/api-server: API Server`, `artifacts/mockup-sandbox: Component Preview Server`).

### GitHub Pages site

```bash
cd github-pages
cp .env.example .env       # fill in VITE_SUPABASE_URL, VITE_SUPABASE_ANON_KEY
npm install
npm run dev                # Vite at http://localhost:5174
```

### Standalone version

`standalone/` contains a flattened, npm-only copy of the Replit app for users who don't want to deal with the monorepo. See `standalone/README.md`.

---

## Building and deploying

### Replit app (Autoscale deployment)

The deploy config is in `artifacts/api-server/.replit-artifact/artifact.toml` and `artifacts/recipe-archiver/.replit-artifact/artifact.toml`. Build commands run automatically on deploy:

- Frontend: `pnpm --filter @workspace/recipe-archiver run build` → `artifacts/recipe-archiver/dist/public/`, served as static files at `/`
- API: `pnpm --filter @workspace/api-server run build` → `artifacts/api-server/dist/index.mjs`, served at `/api` with health check `/api/healthz`

Hit "Publish" / "Deploy" in Replit. The deployment URL is on `*.replit.app`.

### GitHub Pages

```bash
cd github-pages
npm run build              # outputs to ../docs/ and copies index.html → 404.html
cd ..
git add docs/
git commit -m "Build static site"
git push
```

In your GitHub repo:
- **Settings → Pages**
- Source: **Deploy from a branch**
- Branch: `main`, folder: `/docs`

The site goes live at `https://<your-user>.github.io/<repo>/`. Currently configured for `https://bufo311.github.io/recipe-library/`.

The `404.html` copy step is intentional — GitHub Pages serves `404.html` for any unknown path, which lets the SPA router (Wouter) handle deep links.

---

## How features work

### URL import

User pastes a recipe URL on the **New Recipe** page. The flow:

**Replit version** — POST `/api/recipes/scrape` → `artifacts/api-server/src/lib/recipeScraper.ts` fetches the page server-side, extracts JSON-LD `Recipe` metadata, normalizes ingredient/instruction lists, infers Course/Cuisine/Attribute tags, returns the result for the form to pre-fill.

**GitHub Pages version** — `github-pages/src/lib/recipe-scraper.ts` does the same parsing in the browser, but routes the fetch through a public CORS proxy (`api.allorigins.win`, falling back to `corsproxy.io`, with a final fallback to the `r.jina.ai` reader service that returns markdown the scraper can parse) so the browser can read the source page.

Both versions populate the same form fields, where the user reviews/edits before saving.

### Image upload

**Replit:** Browser POSTs the file as `multipart/form-data` to `POST /api/uploads`. Multer buffers it, Sharp resizes (max edge 1200px, JPEG q=75), the API uploads to the Supabase Storage `recipe-images` bucket with the **service role** key, and returns the public URL.

**GitHub Pages:** `github-pages/src/lib/image-upload.ts` resizes in-browser using `<canvas>`, then uploads directly to Supabase Storage with the **anon** key (allowed by the storage RLS policy from setup step 4). The public URL is read back from the Supabase client.

Either way, the **public URL string** ends up in `recipes.image_path` (the column is named for legacy reasons but holds a full URL, not a storage path).

### Gram converter

`/api/recipes/:id/convert-to-grams` (Replit) or `github-pages/src/lib/gram-converter.ts` (static) walks each ingredient line, parses `2 cups flour` style measurements, and converts to grams using a built-in density table. Triggered by the scale icon on a recipe detail page.

### Faceted filtering

The dashboard exposes filter pills for Course, Cuisine, Cook, and Attribute. The `/recipes` (or Supabase `from('recipes')`) query supports each as an exact-match filter — except Attribute which uses Postgres `jsonb @>` containment. The list of available facet values is fetched once via `/recipes/facets` and refreshed whenever recipes change.

### Cook field & "Just mine"

Free-text `cook` column tags who added each recipe. The new-recipe form remembers the last value in `localStorage["spencer-cook"]`; the dashboard exposes a **★ Just mine** shortcut that filters to that name.

### Auth

There is no user auth. The Replit deployment has a soft password gate (`APP_PASSWORD`) handled in `src/lib/auth.tsx`; the GitHub Pages site has the same gate but anyone determined enough can bypass it by setting `localStorage`.

---

## Theme system

`src/lib/theme.ts` (mirrored in both apps) defines a 10-color palette with documented roles:

| Key | Role |
|---|---|
| `maroon` | Left column, wax seal, dark accents |
| `teal` | Info bands, cable pattern, links |
| `gold` | Lettering, rules, ornamental borders |
| `rose` | Accent strips, filter pills, highlights |
| `cream` | Text on dark backgrounds, paper areas |
| `parch` | Alternating table rows, form areas |
| `black` | Outer frames, nav header, title bands |
| `ink` | Body text, borders, labels |
| `powder` | Image tile backgrounds |
| `sage` | Title bands — MILLS-style backgrounds |
| `bg` | Page wallpaper (tile pattern base) |

Themes are persisted to `localStorage["spencers-theme"]`. The reference page (`/reference`) lets you tweak any color and save your custom default.

---

## Banner system

Each recipe detail page shows a decorative SVG banner with the title curling along a hand-tuned ribbon path. Three banner variants live in `src/assets/`:

- `banner-1.svg` — original ribbon design
- `banner-2.svg` — green/coral variant
- `banner-3.svg` — purple/yellow variant

The `BANNERS` registry in `src/pages/recipe-detail.tsx` (mirrored in both apps) holds each banner's SVG, text-curve `<path d="...">`, and `sm:` overhang placement (left/top/width as percentages of the title zone).

```ts
const BANNERS: Banner[] = [
  { src: banner1Svg, curve: "M 61.8 91.6 C ...", leftPct: -26.7, topPct: -14.7, widthPct: 94.2 },
  { src: banner2Svg, curve: "M 45.4 90.4 C ...", leftPct: -24.6, topPct: -21.9, widthPct: 96.1 },
  { src: banner3Svg, curve: "M 46.8 53.6 C ...", leftPct: -27.4, topPct: -10.0, widthPct: 99.4 },
];
```

`pickBanner(recipe.id)` runs a one-step LCG over the id to deterministically pick a banner — same recipe always shows the same banner, but the choice is well-spread across sequential ids.

The text rides the curve via SVG `<textPath>`. A `useLayoutEffect` measures the rendered text vs. the path length and shrinks the font if the title overflows. On mobile the banner stretches full-width inline (negative `-mx-4` margin); on `sm:` and up it floats over the title zone using the registered overhang percentages exposed as CSS custom properties.

**Adding a new banner:** drop the SVG into `src/assets/`, append an entry to `BANNERS`, and tune the curve/placement using the playground (next section).

---

## Mockup sandbox / Banner Playground

`artifacts/mockup-sandbox/` is an internal Vite app that previews React components in isolation. The most-used mockup is the **Banner Playground** at `src/components/mockups/banner-playground/BannerPlayground.tsx`.

It renders a mock recipe card with the same title-zone styling as production, plus draggable handles to position the banner and reshape its text curve:

- **Banner switcher** — buttons at the top swap between Banner 1 / 2 / 3, each with its own persisted state
- **Drag the banner** to set `leftPct` / `topPct`
- **Gold corner handle** to set `widthPct`
- **Blue/green dots** on the dashed red curve to reshape the cubic bezier
- **Drag the dashed curve** itself to slide it as a unit
- **Reset** button restores defaults for the active banner

The readout at the top shows live values; copy them into the `BANNERS` registry in both `recipe-detail.tsx` files when you're happy.

---

## Common gotchas

- **"`pnpm dev` does nothing at the root"** — by design. Each artifact runs through its own workflow. Use `pnpm --filter @workspace/<name> run dev` or the Replit Run button.
- **Static site can't see a new column** — you forgot to run the `ALTER TABLE` in Supabase SQL Editor. Replit's `db push` only touches the DB when run from Replit.
- **CORS errors when scraping a URL** — public CORS proxies rate-limit and occasionally die. The static scraper falls back through a list; if all fail, paste the recipe manually. The Replit version doesn't have this problem.
- **Image upload returns 403 on the static site** — the storage RLS policies from setup step 4 weren't applied.
- **Build outputs to the wrong place** — `github-pages/` builds into `../docs/` (the GitHub Pages source). Don't change `outDir` unless you also update GitHub Pages settings.
- **Tailwind purges dynamic class names** — that's why per-banner positions are passed as inline CSS variables (`--bnr-l`, `--bnr-t`, `--bnr-w`) referenced from a static class like `sm:left-[var(--bnr-l)]`, instead of generating `sm:left-[-26.7%]` on the fly.
- **Two `theme.ts` and two `recipe-detail.tsx` files** — yes, on purpose. Mirror UI changes into both `artifacts/recipe-archiver/src/` and `github-pages/src/`.

---

## Useful commands cheat sheet

```bash
# Typecheck everything (libs are built first as project references)
pnpm run typecheck

# Build everything
pnpm run build

# Regenerate API client + Zod schemas after editing lib/api-spec/openapi.yaml
pnpm --filter @workspace/api-spec run codegen

# Push the Drizzle schema to the configured DATABASE_URL
pnpm --filter @workspace/db run push

# Build the static GitHub Pages site
cd github-pages && npm run build

# Run an individual artifact in dev
pnpm --filter @workspace/recipe-archiver run dev
pnpm --filter @workspace/api-server   run dev
pnpm --filter @workspace/mockup-sandbox run dev
```
