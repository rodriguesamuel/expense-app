# Expense Tracker

Personal expense tracking app built with Next.js 16 + Supabase.

## Features

- Email/password auth with password reset
- Expense CRUD with date, amount, description, payment type
- Customizable payment types (5 renamable defaults + add your own)
- Reports with charts and CSV export
- Responsive design (mobile + desktop)

## Tech Stack

- **Framework**: Next.js 16 (App Router, Server Actions)
- **Database + Auth**: Supabase (PostgreSQL + RLS)
- **UI**: Tailwind CSS v4
- **Charts**: Recharts
- **Hosting**: Vercel (free)

## Setup

### 1. Supabase

1. Create a project at [supabase.com](https://supabase.com)
2. Run `supabase/migrations/001_initial_schema.sql` in the SQL Editor
3. Run `supabase/migrations/002_categories_budgets.sql` in the SQL Editor. This creates the categories and budgets tables, adds the category relationship to expenses, and updates the expense report view.
4. If the application still reports that `public.categories` is missing, use **Settings → API → Reload schema cache** in Supabase, or run:
   ```sql
   NOTIFY pgrst, 'reload schema';
   ```
5. Enable `pg_cron` extension and run the keepalive query:
   ```sql
   SELECT cron.schedule('keepalive', '0 12 */4 * *', 'SELECT 1');
   ```
6. Copy Project URL and anon key from Project Settings → API

### 2. Local development

```bash
npm install
cp .env.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### 3. Deploy to Vercel

1. Push to GitHub
2. Import repo at [vercel.com](https://vercel.com)
3. Add environment variables: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_SITE_URL`
4. Deploy — auto-deploys on every `git push`
5. Update Supabase Auth settings → Site URL and Redirect URLs to your Vercel domain

## Free tier limits

| Service | Limit |
|---|---|
| Vercel Hobby | 100 GB bandwidth/month |
| Supabase Free | 500 MB DB (~2.5M expense rows), 50K MAU |
| Supabase Free | Project pauses after 7 days inactivity → fixed by pg_cron keepalive |
