# Recipe Archiver — GitHub Pages (Static)

A fully static build of the Recipe Archiver. No server, no Node.js, no backend — just HTML + JS that runs in the browser and talks directly to Supabase.

**Hosted at:** `https://bufo311.github.io/recipe-library/`

Delete your Replit account tomorrow. This site keeps working as long as your Supabase project exists.

## How it works

```
Browser (GitHub Pages static files)
    │
    ├── Reads / writes recipes → Supabase PostgreSQL (via anon key)
    ├── Uploads images         → Supabase Storage (via anon key)
    └── Scrapes recipe URLs    → corsproxy.io → target site (parsed in browser)
```

## One-time Supabase setup

### 1. Get your anon key

Supabase Dashboard → **Settings → API → anon public** key.  
This key is safe to expose in frontend code.

### 2. Enable table access (Row Level Security)

Go to Supabase → **SQL Editor** and run:

```sql
-- Allow browser to read and write recipes without authentication
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read" ON recipes
  FOR SELECT TO anon USING (true);

CREATE POLICY "Public insert" ON recipes
  FOR INSERT TO anon WITH CHECK (true);

CREATE POLICY "Public update" ON recipes
  FOR UPDATE TO anon USING (true) WITH CHECK (true);

CREATE POLICY "Public delete" ON recipes
  FOR DELETE TO anon USING (true);
```

### 3. Enable Storage access

In Supabase → **SQL Editor**:

```sql
-- Allow browser to upload and read recipe images
CREATE POLICY "Public upload" ON storage.objects
  FOR INSERT TO anon WITH CHECK (bucket_id = 'recipe-images');

CREATE POLICY "Public read" ON storage.objects
  FOR SELECT TO anon USING (bucket_id = 'recipe-images');
```

## Build and deploy

### Prerequisites

- Node.js 20+
- npm

### Install

```bash
cd github-pages
npm install
```

### Configure

```bash
cp .env.example .env
```

Edit `.env`:
```
VITE_SUPABASE_URL=https://[your-ref].supabase.co
VITE_SUPABASE_ANON_KEY=eyJ...your-anon-key...
VITE_BASE_PATH=/recipe-library/
```

### Build

```bash
npm run build
```

This outputs to `docs/` at the root of the repo (one level up). That's the folder GitHub Pages serves.

### Push to GitHub

```bash
cd ..   # go to repo root
git add docs/
git commit -m "Build static site"
git push
```

Then in your GitHub repo → **Settings → Pages**:
- Source: **Deploy from a branch**
- Branch: `main`
- Folder: `/docs`

Your site is live at `https://bufo311.github.io/recipe-library/`.

### Dev mode (local preview)

```bash
cd github-pages
npm run dev
```

Opens at `http://localhost:5174`. Uses your `.env` for Supabase credentials.

## Custom domain

If you want `yoursite.com` instead of `bufo311.github.io/recipe-library/`:

1. In `github-pages/.env`, change `VITE_BASE_PATH=/`
2. Rebuild and push
3. In GitHub Pages settings, add your custom domain
4. Point your domain's DNS to GitHub Pages (see GitHub docs)
