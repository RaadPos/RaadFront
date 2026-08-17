-- ─────────────────────────────────────────────────────────────────────────
-- rpc_public_storefront(slug) : the ENTIRE public data contract.
--
-- SECURITY DEFINER + granted to anon. This is the security surface for the web
-- storefront: it resolves the slug, joins the business, buckets stock, filters
-- show_online, and returns ONLY whitelisted fields as JSON. The Next.js service
-- (lib/storefront.service.ts) calls this and nothing else. To expose a new
-- public field, add it HERE — never widen a raw table read.
--
-- Run in: Supabase → SQL Editor.  Test: select rpc_public_storefront('dhawaaq-a1');
-- ─────────────────────────────────────────────────────────────────────────

create or replace function rpc_public_storefront(p_slug text)
returns jsonb
language plpgsql
security definer
set search_path = public
stable
as $fn$
declare
  v_slug     text := lower(trim(coalesce(p_slug, '')));
  v_settings storefront_settings%rowtype;
  v_biz      bussiness%rowtype;
begin
  if length(v_slug) < 3 then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select * into v_settings
  from storefront_settings
  where slug = v_slug and is_published = true;

  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  select * into v_biz from bussiness where id = v_settings.business_id;
  if not found then
    return jsonb_build_object('ok', false, 'error', 'not_found');
  end if;

  return jsonb_build_object(
    'ok', true,
    'store', jsonb_build_object(
      'business', jsonb_build_object(
        'name',      v_biz.company_name,
        'address',   v_biz.business_address,
        'whatsapp',  v_settings.whatsapp_e164,
        'logo_url',  v_biz.logo_url,
        'cover_url', v_settings.cover_url,
        'currency',  v_biz.currency,
        'hours',     v_settings.hours_json
      ),
      'products', (
        select coalesce(jsonb_agg(jsonb_build_object(
          'id',       p.id,
          'name',     p.name,
          'price',    p.price,
          'image',    p.image,
          'category', p.category,
          'stock_bucket', case
            when v_settings.hide_stock_indicators then null
            when coalesce(p.stock, 0) = 0 then 'out'
            when coalesce(p.stock, 0) <= 5 then 'low'
            else 'in'
          end
        ) order by p.name), '[]'::jsonb)
        from products p
        where p.business_id = v_settings.business_id
          and coalesce(p.show_online, true) = true   -- matches column default
      )
    )
  );
end;
$fn$;

-- The RPC is the only thing anon may call — nothing else.
revoke all on function rpc_public_storefront(text) from public;
grant execute on function rpc_public_storefront(text) to anon, authenticated;
