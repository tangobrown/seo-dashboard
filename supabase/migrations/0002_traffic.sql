-- Analytics: store the latest SiteGuru traffic overview (GA4 + Search Console)
-- snapshot per client. Refreshed on each sync. Run this in the Supabase SQL Editor.

alter table clients add column if not exists traffic jsonb;
