-- ─────────────────────────────────────────────────────────────────────────
-- Create a published test storefront you can open at:  /dhawaaq-a1
-- Matches the real schema (uuid ids). Run in Supabase → SQL Editor.
-- Adjust the products insert to your actual products table columns.
-- ─────────────────────────────────────────────────────────────────────────
do $$
declare
  v_biz uuid;
begin
  -- 1) A business (uuid id auto-generated)
  insert into bussiness (company_name, business_address, currency, is_active)
  values ('Dhawaaq A1', 'Bakaaro Market, Mogadishu', 'USD', true)
  returning id into v_biz;

  -- 2) Its published storefront settings — the slug is the public URL
  insert into storefront_settings
    (business_id, slug, is_published, whatsapp_e164, cover_url, hide_stock_indicators)
  values
    (v_biz, 'dhawaaq-a1', true, '+252610000000', null, false)
  on conflict (business_id) do update
    set slug = excluded.slug,
        is_published = true,
        whatsapp_e164 = excluded.whatsapp_e164;

  -- 3) Products — uncomment and match your real products table columns.
  --    The service reads business_id + (name|title), (price|selling_price),
  --    (image|image_url), (category|category_name), (stock|quantity), show_online.
  -- insert into products (business_id, name, price, image, category, stock, show_online) values
  --   (v_biz, 'Sample Phone 128GB', 129.00, null, 'Phones',      12, true),
  --   (v_biz, 'Wireless Earbuds',    39.00, null, 'Audio',        4, true),
  --   (v_biz, 'Fast Charger 65W',    19.00, null, 'Accessories', 30, true);

  raise notice 'Test store ready → open /dhawaaq-a1 (business_id=%)', v_biz;
end $$;
