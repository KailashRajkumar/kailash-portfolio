# Kailash Rajkumar — Portfolio

Personal portfolio of Kailash Rajkumar, full-stack developer in Dubai.

**Live:** <https://kailashrajkumar.github.io/kailash-portfolio/>

- Light iOS-style glass UI with a dark-mode toggle
- Projects, skills, experience and education loaded from Supabase
- Contact form that opens a pre-filled WhatsApp chat
- Admin CMS at [`/admin-user`](https://kailashrajkumar.github.io/kailash-portfolio/admin-user) for editing content without code changes

## Tech stack

React 19 · TanStack Start (SPA mode) + TanStack Router/Query · Tailwind CSS 4 · shadcn/ui · Motion · Supabase (Postgres, Auth, Storage)

## Local development

Requires Node.js 22+.

```sh
git clone https://github.com/KailashRajkumar/kailash-portfolio.git
cd kailash-portfolio
npm install
npm run dev          # http://localhost:3000
```

`npm run build` outputs a static site to `dist/client` (served under `/kailash-portfolio/`).
Set `BASE_PATH=/` when building for a custom domain.

## Environment

The Supabase URL and **publishable** key live in `.env`. They are safe to commit because they ship in the browser bundle, and row-level security protects the data. Never commit a `service_role` / `sb_secret_` key.

```sh
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

## Deployment

Every push to `main` runs [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml), which builds the site and publishes it to GitHub Pages.

One-time setup: the repo must be public (or on GitHub Pro), and **Settings → Pages → Source** must be set to **GitHub Actions**.

## Database

The schema lives in [`supabase/migrations`](supabase/migrations) and a content snapshot in [`supabase/seed.sql`](supabase/seed.sql).

To stand up a fresh Supabase project:

1. Create a project at [supabase.com](https://supabase.com) (the free tier is enough).
2. Apply the schema: `npx supabase link --project-ref <ref> && npx supabase db push`, or paste each migration into the SQL editor in order.
3. Load the content: paste `supabase/seed.sql` into the SQL editor.
4. Put the new URL and publishable key into `.env`, then push to `main`.
5. In **Authentication → URL Configuration**, set the Site URL to `https://kailashrajkumar.github.io/kailash-portfolio/`.
6. Open `/admin-user` and create an account. **The first account created becomes the admin.**
