# Recipe Archiver

A personal cookbook web app for saving, organizing, and browsing recipes. Paste a URL from any food blog to auto-import — the scraper strips out the life stories and ads, extracts ingredients and instructions, and guesses tags for you to review before saving. Recipes you write manually are supported too.

## Features

- **URL Import with Review** — paste a recipe URL, the backend scrapes JSON-LD metadata, auto-guesses Course/Cuisine/Attribute tags, and opens a pre-filled form for you to review before saving
- **Faceted Tag System** — organize recipes by Course (Breakfast, Dinner, Dessert…), Cuisine (Italian, Mexican…), and freeform Attributes (Quick, Vegan, One-Pot…)
- **Filter Bar** — click tag chips on the dashboard to narrow the recipe grid in real time
- **Gram Converter** — convert US volume measurements to grams on any recipe detail page
- **Image Upload** — attach a photo to any recipe; images are stored in Supabase Storage and served via CDN

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, shadcn/ui |
| Backend | Node.js, Express 5, TypeScript |
| Database | PostgreSQL via Supabase (Drizzle ORM) |
| Image Storage | Supabase Storage |
| API Contract | OpenAPI 3 spec, Orval codegen (React Query hooks + Zod schemas) |
| Package Manager | pnpm workspaces (monorepo) |

## Project Structure

```
├── artifacts/
│   ├── api-server/     # Express backend
│   └── recipe-archiver/ # React + Vite frontend
├── lib/
│   ├── api-spec/       # OpenAPI spec + Orval config
│   ├── api-client-react/ # Generated React Query hooks
│   ├── api-zod/        # Generated Zod validation schemas
│   └── db/             # Drizzle ORM schema + migrations
└── scripts/            # Shared utility scripts
```

## Setup

### Prerequisites

- Node.js 20+
- pnpm 9+
- A [Supabase](https://supabase.com) project

### Environment Variables

Create a `.env` file in the repo root (or set these in your hosting environment):

| Variable | Where to find it | Purpose |
|---|---|---|
| `DATABASE_URL` | Supabase Dashboard → Settings → Database → Connection String → URI (Session mode, port 5432) | PostgreSQL connection for Drizzle ORM |
| `SUPABASE_URL` | Supabase Dashboard → Settings → API → Project URL | Supabase JS client |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → `service_role` key | Server-side image uploads (never expose to browser) |
| `PORT` | Set by your host | Port the API server listens on |
| `SESSION_SECRET` | Any random string | Express session signing |

### Supabase Setup

1. Create a new Supabase project
2. In **Storage**, create a bucket named `recipe-images` and set it to **Public**
3. The database schema is applied automatically via Drizzle migrations on first run (see below)

### Install & Run

```bash
# Install all workspace dependencies
pnpm install

# Apply database schema to Supabase
pnpm --filter @workspace/db run db:push

# Start both services in development
# Terminal 1 — API server
pnpm --filter @workspace/api-server run dev

# Terminal 2 — Frontend
pnpm --filter @workspace/recipe-archiver run dev
```

### Regenerate API Client (after OpenAPI changes)

```bash
pnpm --filter @workspace/api-spec run codegen
```

## Deployment

The app is structured as two services behind a shared reverse proxy:

- **Frontend** — static Vite build, served at `/`
- **API** — Express server, served at `/api`

Both services read `PORT` from the environment. Set `DATABASE_URL`, `SUPABASE_URL`, and `SUPABASE_SERVICE_ROLE_KEY` as environment variables in your host.
