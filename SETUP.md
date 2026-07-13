# Setup — SEO Autopilot (Milestone 1)

A Next.js + Supabase dashboard that pulls SEO recommendations from SiteGuru per
client and lets an admin accept/decline them. Milestone 1 stops before any live
site-editing automation.

## Prerequisites

- Node 18+ (you have 24) and npm
- A free Supabase project
- (Deploy) a Vercel account

## 1. Create a Supabase project

1. Go to https://supabase.com → New project. Pick a name, region, and a strong
   database password (save it).
2. Wait for it to finish provisioning.

## 2. Get your keys

Project → **Settings → API**. Copy:

- **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
- **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (secret — server only)

## 3. Create the database schema

Project → **SQL Editor** → New query → paste the contents of
[`supabase/migrations/0001_init.sql`](supabase/migrations/0001_init.sql) → **Run**.

## 4. Create your admin login

1. Project → **Authentication → Users → Add user** → enter your email + a
   password, and tick "Auto Confirm User".
2. Copy that user's **UID**.
3. SQL Editor → run (replace the UID):

   ```sql
   insert into profiles (user_id, role) values ('PASTE-UID-HERE', 'admin');
   ```

## 5. Local env

```bash
cp .env.local.example .env.local
```

Fill in the three Supabase values from step 2. Leave `SITEGURU_TRANSPORT=fixture`.

## 6. Run it

```bash
npm run dev
```

Open http://localhost:3000, sign in with your admin credentials.

## 7. Load real recommendations

1. In the app: **Clients → New client**. Set **SiteGuru site (domain)** to
   `devonjoinery.co.uk`. (Optionally add a viewer email + password to create a
   read-only client login.)
2. Pull the data:

   ```bash
   npm run sync:siteguru
   ```

   Or click **Pull SiteGuru now** on the client page. You should see 9 real
   recommendations — 6 auto, 3 manual.

## 8. Deploy (Vercel)

Import the repo in Vercel, add the same env vars (keep `SUPABASE_SERVICE_ROLE_KEY`
un-prefixed so it stays server-only), and deploy.

## Follow-up (not blocking)

`SITEGURU_TRANSPORT=fixture` reads a captured real payload. Switching to live
weekly pulls needs SiteGuru's server-to-server auth confirmed and the
`src/lib/siteguru/transports/mcp-http.ts` transport implemented — see the plan's
risk R1.
