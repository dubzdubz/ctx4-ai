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

1. In Supabase Dashboard → **Authentication** → **URL Configuration**:
   - Set **Site URL** to `http://localhost:3000` (or your production URL)
   - Add `http://localhost:3000/auth/confirm` to **Redirect URLs**

2. In **Authentication** → **Email Templates** → **Magic Link**, replace the default link with the PKCE/server-side template ([docs](https://supabase.com/docs/guides/auth/auth-email-passwordless#with-magic-link)):

```html
<a href="{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email">Log in</a>
```

This sends users directly to your app with the token in the URL; your server exchanges it for a session. Without this change, the default template uses Supabase's verify endpoint—which requires the same browser/device where the magic link was requested (PKCE code_verifier limitation).
