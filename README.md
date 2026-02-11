# ctx4.ai

Your portable context layer for Claude & ChatGPT

## Development

1. Copy `.env.example` to `.env.local` and add your Supabase credentials from [dashboard](https://supabase.com/dashboard/project/_/settings/api)
2. Run the dev server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Auth (Magic Link)

Magic link auth is configured. To make it work:

In Supabase Dashboard → **Authentication** → **URL Configuration**:
- Set **Site URL** to `http://localhost:3000` (or your production URL)
- Add `http://localhost:3000/auth/confirm` to **Redirect URLs**
