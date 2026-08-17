# Raad Storefront

A single-page web storefront built with **Next.js 14 (App Router)**, **TypeScript**, and **Tailwind CSS**, backed by **Supabase**. Each published store is served from its own URL slug (`/<slug>`), fully server-rendered from the real business — no backend credentials ever reach the browser.

## Architecture (server API → service → RPC → display)

```
Browser / Flutter
      │  GET /<slug>            (or GET /api/storefront/<slug>)
      ▼
app/[slug]/page.tsx   ── server component, renders HTML
app/api/.../route.ts  ── server API, returns sanitized JSON
      │  both call ▼
lib/storefront.service.ts  ── SERVER-ONLY. Calls ONE thing:
      │                         sb.rpc('rpc_public_storefront', { p_slug })
      ▼
Postgres  ── rpc_public_storefront (SECURITY DEFINER, granted to anon):
             slug → published check → join bussiness → bucket stock →
             filter show_online → return ONLY whitelisted JSON.
```

The RPC is the **entire public data contract**. The service never touches raw
tables — it just maps the already-sanitized RPC payload into view models. To
expose a new public field, add it to the RPC, not the TypeScript.

- **Service** `lib/storefront.service.ts` — the only DB caller. React-`cache`d so the page + metadata share one call.
- **API** `/api/storefront/<slug>` — returns the same sanitized JSON (for Flutter / external callers). CDN-cacheable.
- **Page** `/<slug>` — server component; calls the service directly (no extra hop), `notFound()` → 404.
- **Revalidate** `POST /api/revalidate` — busts both caches when a store changes.

## Security model

- Only the **anon key** is used, and only to call `rpc_public_storefront` (a SECURITY DEFINER function granted to `anon`). No service-role key — least privilege. The anon key cannot read RLS-protected tables directly.
- Secrets live in `.env.local` with **no `NEXT_PUBLIC_` prefix**, so Next.js cannot bundle them into browser JS. `lib/supabase.ts` starts with `import "server-only"` → importing it from a Client Component is a **build error**.
- All sanitization (whitelisted columns, stock bucketing, `show_online` filter) happens **inside Postgres**, where the sensitive columns live. Cost/supplier/email fields never cross the network.
- The interactive `Storefront` client component only receives sanitized props — it performs **no data access**.
- Verified: the client bundle (`.next/static`) contains no keys, table names, `business_id`, RPC name, or `createClient`.

## Routes

| Route                      | Rendering          | Purpose                                          |
| -------------------------- | ------------------ | ------------------------------------------------ |
| `/`                        | Static             | Placeholder landing (replace later)              |
| `/[slug]`                  | Dynamic (ISR 60s)  | Live storefront resolved by slug via the RPC     |
| `/api/storefront/[slug]`   | Dynamic            | Sanitized JSON API for the same store            |
| `/api/revalidate` (POST)   | Dynamic            | Cache invalidation on publish/unpublish/edit     |

## Setup

1. **Env** — fill real values from Supabase → Settings → API:
   ```bash
   cp .env.example .env.local
   # SUPABASE_URL + SUPABASE_ANON_KEY   (+ optional REVALIDATE_SECRET)
   ```
2. **The RPC** — `supabase/rpc_public_storefront.sql` documents the contract. If
   it isn't already in your project, run it in the SQL Editor. Test:
   ```sql
   select rpc_public_storefront('dhawaaq-a1');
   ```
3. **A published store** — from the Flutter admin (`rpc_save_storefront_settings`)
   or `supabase/seed.example.sql` to create a `/dhawaaq-a1` test store.
4. **Run**:
   ```bash
   npm install
   npm run dev        # http://localhost:3000
   ```
   - `/dhawaaq-a1` → the actual business + products.
   - `/api/storefront/dhawaaq-a1` → the same data as JSON.
   - `/does-not-exist` → 404.

## Cache invalidation (on publish)

The page (ISR) and the API (`s-maxage`) are separate caches. After a merchant
publishes/unpublishes/edits, call the revalidate endpoint so both drop the stale
copy immediately:

```bash
curl -X POST https://YOUR-HOST/api/revalidate \
  -H "x-revalidate-secret: $REVALIDATE_SECRET" \
  -H "content-type: application/json" \
  -d '{"slug":"dhawaaq-a1"}'
```

Wire this from a Supabase webhook / edge function triggered by
`rpc_save_storefront_settings`.

## Flutter integration

```dart
const String kStorefrontBaseUrl = 'http://localhost:3000'; // deploy: your prod URL
```
The Share / QR / Copy buttons then generate `http://localhost:3000/<slug>` links,
matching `publicUrl(slug)` in `StorefrontService`.
