# Supabase user setup

The frontend uses the public Supabase URL and publishable/anon key. These values are safe to expose when Row Level Security is enabled.

Never put the Supabase `service_role` key in frontend code, GitHub Pages, or Vite env variables.

## 1. Create tables

In Supabase, open SQL Editor and run:

```text
docs/supabase-user-schema.sql
```

This creates:

- `profiles`
- `favorites`
- `predictions`

It also enables RLS so users can only read and write their own rows.

## 2. Enable Google login

In Supabase:

```text
Authentication -> Providers -> Google
```

Enable Google and add the OAuth client values from Google Cloud.

Add redirect URLs:

```text
http://localhost:5173/**
https://waterdiu.github.io/worldcup-2026/**
```

## 3. GitHub Pages build env

The deploy workflow reads:

```text
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

These are configured as GitHub repository secrets.
