# Project Brief — SEO Autopilot Dashboard

**Status:** Draft v1 · **Owner:** [You] · **Last updated:** 8 June 2026

---

## 1. Objective

Build a multi-tenant admin dashboard that runs SEO maintenance on a portfolio of
client websites with as little manual effort as possible. The dashboard pulls SEO
recommendations from **SiteGuru** (via its MCP), lets the admin **accept or decline**
each one, and — for accepted, machine-implementable changes — **automatically writes
the code, pushes it to the client's repo, and deploys it**. Clients log in to a
read-only view to see what's been done, read the admin's notes, and view their traffic
stats from **Fathom Analytics**.

There are two distinct systems in play. Keep them separate in your head and in the code:

1. **The Dashboard** — the control plane you and your clients log into (this brief's main deliverable).
2. **The managed client sites** — each its own Next.js repo + Vercel project that the dashboard edits and deploys *to*.

> **Scale & cadence (important for design choices):** This runs at **low volume** — one
> recommendation batch (~5 auto + ~3 manual) **per client, per week**, with only a handful
> of clients to start. That means no real-time pressure, no queueing infrastructure, and no
> rate-limit headaches. Ingestion can be a simple **weekly scheduled job**, and the whole
> system can stay deliberately small. Don't over-engineer for throughput that won't exist.

---

## 2. Users & roles

| Role | Who | Can do |
|------|-----|--------|
| **Admin** | You | Everything: create/manage client accounts, view recommendations, accept/decline changes, trigger deploys, add notes & manual tasks, view all stats. |
| **Viewer** | A client | Read-only, scoped to *their own* client record only: see implemented changes, manual recommendations, admin notes, completed tasks, and their Fathom stats. |

Auth and role enforcement run on **Supabase Auth + Postgres Row-Level Security (RLS)**.
A viewer must never be able to read another client's data — this is enforced at the
database layer, not just the UI.

---

## 3. Core user stories

**Admin**
- As an admin, I create a client account by entering: client name, their SiteGuru site, their GitHub repo, their Vercel project, their Fathom site ID, and the viewer's login credentials.
- As an admin, for each client I see a list of SEO issues from SiteGuru, split into **~5 auto-implementable changes** and **~3 manual recommendations**.
- As an admin, I accept or decline each auto-implementable change. Accepting one kicks off an automated code change → push → deploy on that client's site.
- As an admin, I add free-text notes and log completed tasks against a client.

**Viewer (client)**
- As a client, I log in and see which changes have been implemented on my site, with dates.
- As a client, I see the admin's notes and any manually completed tasks.
- As a client, I see the 3 manual recommendations I could action myself.
- As a client, I see traffic statistics (pageviews, visitors, top pages, trends) from Fathom.

---

## 4. System architecture

```
                     ┌─────────────────────────────────────┐
                     │           DASHBOARD APP              │
                     │   Next.js + Tailwind on Vercel       │
                     │   Supabase (Auth + Postgres + RLS)   │
                     └───────────────┬─────────────────────┘
        ┌────────────────────────────┼──────────────────────────────┐
        │                            │                               │
   (read SEO issues)          (trigger change)                 (read stats)
        │                            │                               │
        ▼                            ▼                               ▼
 ┌─────────────┐        ┌──────────────────────────┐         ┌──────────────┐
 │  SiteGuru   │        │   Client GitHub repo      │         │   Fathom     │
 │  (MCP/API)  │        │   + GitHub Actions runner │         │   Analytics  │
 └─────────────┘        │   (Claude Code headless)  │         │   REST API   │
                        └────────────┬─────────────┘         └──────────────┘
                                     │ push to main
                                     ▼
                              ┌──────────────┐
                              │   Vercel     │  ← one project per client
                              │  auto-deploy │
                              └──────────────┘
```

Each managed client site is its **own GitHub repo + Vercel project**, all sharing the
same Next.js + Tailwind infrastructure. The dashboard stores the repo and Vercel
identifiers per client so it knows where to apply a given change.

---

## 5. The automation loop (the hard part)

This is the riskiest and most novel part of the project — automated code is being pushed
to *live client sites*. The flow is **fully automatic** (no human merge step), but each
change goes through an **auto-PR that only merges if automated checks pass**, giving a
revertable paper trail instead of a blind push to `main`.

**Step by step, when the admin clicks "Accept" on a recommendation:**

1. The dashboard records the acceptance and writes an `implementations` row (status: `queued`).
2. The dashboard dispatches a workflow on the client's repo via the GitHub API
   (`workflow_dispatch` / `repository_dispatch`), passing the recommendation as structured input.
3. The repo's GitHub Action runs **Claude Code in headless mode** — either the official
   `anthropics/claude-code-action@v1` or a `claude -p "<instruction>" --output-format json`
   step — to make the precise edit (e.g. update a page's `metadata` export, add alt text,
   inject JSON-LD).
4. The Action commits to a **new branch** and opens a **pull request**.
5. **Guardrail:** the PR triggers a **Vercel preview deployment**. Automated checks run
   (build passes; the targeted SEO field is actually present; no Lighthouse SEO regression).
   On pass → the PR **auto-merges to `main`** and Vercel deploys to production. On failure →
   the PR is left unmerged (or closed) and the recommendation is flagged `failed` for the admin.
6. The dashboard records the **PR URL**, commit SHA, and deploy URL, and surfaces the
   implemented change to the viewer. Because every change is a discrete merged PR, the admin
   can **revert it with one click** from the dashboard (which opens/merges a revert PR through
   the same pipeline).

**What can be auto-implemented (the ~5):** meta titles & descriptions, Open Graph tags,
canonical tags, image alt text, heading structure, internal links, `robots.txt` /
`sitemap.xml`, JSON-LD structured data, simple redirects. These map cleanly to file edits
in a Next.js codebase.

**What's flagged manual (the ~3):** content rewriting/expansion, backlink acquisition,
performance work needing infra changes, UX/design decisions, fixing broken *external*
links. These need human judgement, so the dashboard surfaces them as recommendations
rather than acting on them.

> **Design note — categorisation:** SiteGuru returns a flat list of issues. The dashboard
> needs a **category map** (issue type → `auto` | `manual`) to do the 5/3 split. **v1:** this
> map is **hardcoded** for known SiteGuru issue types (not admin-editable); make it editable
> later if needed. The "5" and "3" are targets, not hard limits — show whatever's available.

---

## 6. Data model (Supabase / Postgres)

| Table | Key fields | Notes |
|-------|-----------|-------|
| `profiles` | `user_id`, `role` (`admin`/`viewer`), `client_id` | Links a Supabase auth user to a role and (for viewers) one client. |
| `clients` | `id`, `name`, `siteguru_site_id`, `github_repo`, `vercel_project_id`, `fathom_site_id`, `created_by` | One row per managed client. |
| `recommendations` | `id`, `client_id`, `source`, `title`, `description`, `category`, `type` (`auto`/`manual`), `status` (`pending`/`accepted`/`declined`/`implemented`/`failed`) | Pulled & categorised from SiteGuru. |
| `implementations` | `id`, `recommendation_id`, `commit_sha`, `pr_url`, `deploy_url`, `status`, `applied_at` | One per accepted auto-change; the audit trail of the deploy. |
| `notes` | `id`, `client_id`, `author_id`, `body`, `created_at` | Free-text admin notes shown to the viewer. |
| `tasks` | `id`, `client_id`, `title`, `description`, `status`, `completed_at` | Manually logged completed work. |
| `audit_log` | `id`, `client_id`, `actor`, `action`, `payload`, `created_at` | Every accept/decline/deploy/rollback, for traceability. |

**RLS policy summary:** admins → full access; viewers → `SELECT` only, and only where
`client_id` matches their `profiles.client_id`.

---

## 7. Integrations

**SiteGuru (MCP)** — SiteGuru offers MCP access on all paid plans. The dashboard connects
to it server-side to pull each client's SEO issue list, on a **weekly schedule** (Vercel
Cron or a scheduled GitHub Action) — one pull per client per week generates that week's
batch. No on-demand polling needed.
> ⚠️ **To verify:** the exact tool/method surface of the SiteGuru MCP (tool names, what an
> "issue" object contains) isn't documented publicly yet. Confirm against SiteGuru's MCP
> docs before building the ingestion layer; the data model above assumes a per-site list of
> typed issues with a title and description.

**Fathom Analytics (REST API)** — Base URL `https://api.usefathom.com/v1`, Bearer-token auth.
Relevant endpoints: `sites`, `aggregations` (pageviews, uniques, visits, avg_duration;
group by pathname/country/date), and `current_visitors`. The API caps aggregations at 10
req/min and counts every call against the account's monthly pageview quota — but at this
volume (a few clients, weekly viewing) **those limits won't bite**. Still, **fetch
server-side** (never expose the API key to the browser) and add **light caching** (e.g.
cache each client's stats for a few minutes) so a viewer refreshing the page doesn't make
redundant calls.

**GitHub** — Use a GitHub App or fine-grained PAT scoped per client repo. Trigger the
automation via `workflow_dispatch`. Node.js 18+ in the Action runner.

**Vercel** — Auto-deploy on push to `main`. Optionally use the Vercel API to read deploy
status and gate preview → production promotion.

**Anthropic / Claude Code** — The headless agent that performs edits, via the official
`anthropics/claude-code-action` (built on the Claude Code SDK) or `claude -p` in CI. Scope
its allowed tools tightly (e.g. read/edit/commit only). **v1 cost cap:** a low `--max-turns`
and a mid-tier model per run — at one batch per client per week, spend is negligible.

---

## 8. Tech stack

- **Framework:** Next.js (App Router) + TypeScript
- **Styling:** Tailwind CSS (+ shadcn/ui optional for prebuilt components)
- **Auth + DB:** Supabase (Auth, Postgres, RLS)
- **Hosting:** Vercel (dashboard app)
- **Automation runner:** GitHub Actions per client repo, `anthropics/claude-code-action`
- **Source control:** GitHub

---

## 9. Security & safety considerations

- **RLS everywhere** — viewer isolation enforced in Postgres, not just the UI.
- **Secrets** — GitHub tokens, Fathom keys, Anthropic keys in env vars / Vercel secrets; scope GitHub tokens per repo, least privilege.
- **No plaintext passwords** — viewer logins go through Supabase Auth. The admin **sets the viewer's initial password directly** via the Auth admin API when creating the client; the credential is created server-side and never stored in plaintext in the app's own tables.
- **Checks-gated auto-PRs** — no automated change reaches production unverified; it merges only on passing checks, and every change is a discrete PR that's one-click revertable.
- **Full audit log** — who accepted what, which commit, which deploy, any rollback.
- **Cost controls** — cap Claude Code turns/model per run; rate-limit & cache Fathom.

---

## 10. Decisions & remaining items

**Decided:**
1. **Change delivery** — accepted auto-changes go via an **auto-PR that auto-merges only when checks pass** (revertable paper trail, no blind push to `main`).
2. **Categorisation** — hardcoded issue-type → auto/manual map in v1; not admin-editable.
3. **Viewer onboarding** — admin **sets the viewer's password directly** via Supabase Auth admin API at client creation.
4. **Cost guardrails** — conservative `--max-turns` + mid-tier model per Claude Code run.
5. **Rollback** — admin can **one-click revert** any implemented change from the dashboard (routes a revert PR through the same pipeline).

**Open (build-time verification, not a product decision):**
- **SiteGuru MCP surface** — confirm the exact MCP tool names and the shape of an "issue" object against SiteGuru's docs before building the ingestion layer (§7). This is the one dependency to validate first, since the recommendation data model rests on it.

---

## 11. Suggested build phases

| Phase | Deliverable |
|-------|-------------|
| **0 — Foundations** | Next.js + Tailwind + Supabase; auth, roles, RLS; admin client CRUD. |
| **1 — Recommendations** | SiteGuru ingestion + categorisation; accept/decline review UI. |
| **2 — Automation** | GitHub Action + Claude Code pipeline for **one** change category, then expand; preview-gate + rollback. |
| **3 — Client portal** | Notes, manual tasks, implemented-changes feed in the viewer view. |
| **4 — Analytics** | Fathom integration (server-side, cached) + viewer stats UI. |
| **5 — Hardening** | Audit log, cost controls, polish, error states. |

> Recommendation: build Phase 2 against a throwaway test repo before pointing it at a real
> client site. The automation loop is where the project's risk concentrates.
