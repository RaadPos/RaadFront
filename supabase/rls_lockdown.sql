-- ═══════════════════════════════════════════════════════════════════════════
-- SECURITY LOCKDOWN — close the anonymous PII hole on bussiness / products /
-- storefront_settings, WITHOUT breaking the authenticated Flutter merchant app.
--
-- Model:
--   • Anonymous shoppers  -> may ONLY call rpc_public_storefront (SECURITY
--     DEFINER, whitelisted fields). No direct table access.
--   • Logged-in merchants -> JWT `authenticated` role + RLS policies.
--
-- The Next.js storefront needs NO change: it already reads via the RPC only,
-- and SECURITY DEFINER bypasses RLS, so it keeps working after this runs.
--
-- Run in Supabase → SQL Editor (runs as the postgres role).
-- ═══════════════════════════════════════════════════════════════════════════


-- ── PHASE 1 — IMMEDIATE: block anon, keep the merchant app working ──────────
-- Safe to run now. Enables RLS (default-deny) and re-opens ONLY for logged-in
-- users with broad policies that mirror today's behaviour. anon has no policy
-- => blocked. Tighten later in Phase 2.

alter table public.bussiness           enable row level security;
alter table public.products            enable row level security;
alter table public.storefront_settings enable row level security;

-- Authenticated users keep full access (exactly like today) so nothing breaks.
drop policy if exists authed_all_bussiness on public.bussiness;
create policy authed_all_bussiness on public.bussiness
  for all to authenticated using (true) with check (true);

drop policy if exists authed_all_products on public.products;
create policy authed_all_products on public.products
  for all to authenticated using (true) with check (true);

drop policy if exists authed_all_storefront on public.storefront_settings;
create policy authed_all_storefront on public.storefront_settings
  for all to authenticated using (true) with check (true);

-- Defense in depth: strip anon's direct table privileges entirely.
revoke all on public.bussiness           from anon;
revoke all on public.products            from anon;
revoke all on public.storefront_settings from anon;

-- Public storefront stays alive (RPC remains anon-executable).
grant execute on function public.rpc_public_storefront(text) to anon, authenticated;


-- ── VERIFY PHASE 1 ──────────────────────────────────────────────────────────
-- With the ANON key these should now return NOTHING / permission denied:
--   GET /rest/v1/bussiness?select=admin_email          -> [] or 401/403
--   GET /rest/v1/products?select=name                  -> [] or 401/403
-- And the public storefront must still work:
--   select rpc_public_storefront('dhadha-a4');         -> ok:true + data


-- ── PHASE 2 — TIGHTEN: scope authenticated to their own business ────────────
-- Replaces the broad "using (true)" so one merchant can't read another's data.
-- ⚠️ Confirm your access model first (owner_id only? + staff/manager emails? +
-- chain parent_business_id?). The template below is OWNER-ONLY — extend it to
-- match how your app grants access, or the Flutter app will lose access for
-- staff/managers.
--
-- Example (owner-scoped). Do NOT run until the membership rule is confirmed:
--
-- drop policy authed_all_bussiness on public.bussiness;
-- create policy biz_member_rw on public.bussiness
--   for all to authenticated
--   using  (owner_id = auth.uid())
--   with check (owner_id = auth.uid());
--
-- drop policy authed_all_storefront on public.storefront_settings;
-- create policy storefront_member_rw on public.storefront_settings
--   for all to authenticated
--   using  (business_id in (select id from public.bussiness where owner_id = auth.uid()))
--   with check (business_id in (select id from public.bussiness where owner_id = auth.uid()));
--
-- drop policy authed_all_products on public.products;
-- create policy products_member_rw on public.products
--   for all to authenticated
--   using  (business_id in (select id from public.bussiness where owner_id = auth.uid()))
--   with check (business_id in (select id from public.bussiness where owner_id = auth.uid()));
