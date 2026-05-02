# Recipe Archiver — Standalone

A personal cookbook app. Import recipes from any food blog (no ads, no life stories), manually write your own, organize with tags, and convert measurements to grams.

## What's in here

This is a **self-contained, portable version** of the app — no monorepo, no workspace tooling. One `package.json`, clones anywhere, runs anywhere Node.js runs.

```
standalone/
├── client/          # React + Vite frontend
│   └── src/
│       ├── components/
│       ├── pages/
│       ├── hooks/
│       └── lib/
├── server/          # Express backend
│   ├── db.ts        # Drizzle ORM schema + DB connection
│   ├── routes.ts    # All API endpoints
│   ├── index.ts     # Entry point
│   └── lib/         # recipeScraper, gramConverter, supabase
├── .env.example     # Required environment variables
├── drizzle.config.ts
├── package.json
└── vite.config.ts
```

## Prerequisites

- Node.js 20+
- npm or pnpm
- A [Supabase](https://supabase.com) project (free tier works fine)

## Setup

### 1. Clone and install

```bash
git clone https://github.com/bufo311/recipe-library
cd recipe-library/standalone
npm install
```

### 2. Set up environment variables

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase → Settings → Database → Connection String → URI (Session mode, port 5432) |
| `SUPABASE_URL` | Supabase → Settings → API → Project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase → Settings → API → service_role key (keep secret!) |

### 3. Set up Supabase Storage

In your Supabase dashboard:
1. Go to **Storage**
2. Create a new bucket named `recipe-images`
3. Set it to **Public**

### 4. Push the database schema

```bash
npm run db:push
```

This creates the `recipes` table in your Supabase Postgres database.

### 5. Run in development

```bash
npm run dev
```

This starts both the API server (port 3000) and the Vite frontend (port 5173) at the same time. Open [http://localhost:5173](http://localhost:5173) in your browser.

Or run them separately if you prefer:

```bash
# API server only
npm run dev:server

# Frontend only (proxies /api → localhost:3000)
npm run dev:client
```

## Production build & run

```bash
npm run build
npm start
```

The Express server serves the built frontend at `/` and the API at `/api`. Set `PORT` to control which port it listens on.

## Deploying

This app works on any Node.js platform. Recommended options:

| Platform | Notes |
|---|---|
| [Render](https://render.com) | Free tier, `npm run build` as build command, `npm start` as start command |
| [Railway](https://railway.app) | Easy, just connect the repo |
| [Fly.io](https://fly.io) | More control, Dockerfile optional |
| [Vercel](https://vercel.com) | Works but requires splitting frontend/backend — not recommended for this setup |

Set all three environment variables (`DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) in your host's environment settings.

## Features

- **URL Import** — paste any recipe URL, the scraper extracts ingredients and instructions from JSON-LD structured data
- **Auto-tagging** — Course, Cuisine, and Attribute tags are guessed from recipe metadata and keywords
- **Review before saving** — scraped recipes open a pre-filled form for you to review and correct
- **Gram Converter** — toggle between volume measurements and grams on any recipe detail page
- **Image Upload** — stored in Supabase Storage, served via CDN
- **Faceted filtering** — filter recipes by Course, Cuisine, or Attribute tags
