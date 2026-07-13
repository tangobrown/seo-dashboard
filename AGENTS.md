<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.

Notably: the request-gating file convention is `src/proxy.ts` (exporting `proxy`), not `middleware.ts`. `cookies()`/`params` are async.
<!-- END:nextjs-agent-rules -->

# SEO Autopilot

An SEO agency dashboard: pulls SEO issues from **SiteGuru** per client, splits them
into `auto` (mechanically fixable in code) vs `manual` (needs a human), and lets an
admin accept/decline. A later milestone will auto-edit client repos via GitHub
Actions + headless Claude Code; **this milestone stops before any site editing.**

- **Stack:** Next.js (App Router) + TypeScript + Tailwind + Supabase (Auth/Postgres/RLS), Vercel.
- **Setup:** see [SETUP.md](SETUP.md). Schema in `supabase/migrations/0001_init.sql`.
- **Design reference:** the original vanilla-JS prototype is frozen in `prototype/`.
- **Product brief:** `docs/seo-autopilot-dashboard-brief.md`.

## Layout
- `src/app/(admin)/…` — admin app (clients, client tabs, settings, deploys). Guarded by `requireAdmin`.
- `src/app/(viewer)/portal` — read-only client portal. Guarded by `requireViewer`.
- `src/lib/supabase/{server,client,admin}.ts` — session client (RLS), browser client, and service-role client (`server-only`, bypasses RLS).
- `src/lib/siteguru/` — ingestion. `SiteGuruClient` interface with swappable transport (`SITEGURU_TRANSPORT`): `fixture` (captured payload, default and offline) or `mcp` (live pulls via `@modelcontextprotocol/sdk` Streamable-HTTP against `mcp.siteguru.co/mcp`, auth via `SITEGURU_API_KEY` Bearer token). `categorize.ts` maps SiteGuru `check_name` → auto/manual.
- `src/lib/actions/` — server actions (clients, recommendations, notes, auth).
- Accepting a rec updates status + writes `audit_log`; the Phase-2 seam (dispatch a repo workflow) is marked with a comment in `src/lib/actions/recommendations.ts`.

## Notes
- SiteGuru payloads are inconsistent (camelCase vs snake_case across calls); `src/lib/siteguru/types.ts` normalizes both and keeps `raw`.
- Run `npm run sync:siteguru` to load real recommendations into the DB.
