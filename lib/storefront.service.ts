import "server-only";
import { cache } from "react";
import { getSupabaseServer } from "@/lib/supabase";
import {
  formatPrice,
  parseHours,
  type ProductView,
  type StockBucket,
  type Storefront,
  type StoreView,
} from "@/lib/storefront";

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Single source of truth for resolving a public storefront by slug.
 *
 * Security model: calls `rpc_public_storefront(p_slug)` — a SECURITY DEFINER
 * function granted to `anon` that returns ONLY whitelisted fields. All the
 * sensitive work happens inside Postgres, where the sensitive columns live:
 *   - the slug -> business_id resolution + published check,
 *   - the join to bussiness (name/address/currency only),
 *   - stock bucketing (respecting hide_stock_indicators),
 *   - the show_online filter (coalesce(show_online, true) matches the DB default).
 *
 * This service never touches raw tables. The RPC is the ENTIRE public data
 * contract — to expose a new field, add it there, not here.
 *
 * Wrapped in React `cache` so the page + generateMetadata share one DB hit.
 */
export const getStorefrontBySlug = cache(
  async (slugRaw: string): Promise<Storefront | null> => {
    const slug = (slugRaw ?? "").trim().toLowerCase();
    if (slug.length < 3) return null;

    const sb = getSupabaseServer();
    const { data, error } = await sb.rpc("rpc_public_storefront", {
      p_slug: slug,
    });

    if (error) {
      console.error("rpc_public_storefront failed:", error.message);
      return null;
    }
    if (!data || (data as any).ok !== true) return null; // not_found / unpublished

    const raw = (data as any).store;
    const currency: string | null = raw?.business?.currency ?? null;

    const store: StoreView = {
      name: raw?.business?.name ?? "Store",
      address: raw?.business?.address ?? null,
      whatsapp: raw?.business?.whatsapp ?? null,
      logoUrl: raw?.business?.logo_url ?? null,
      coverUrl: raw?.business?.cover_url ?? null,
      currency,
      hours: parseHours(raw?.business?.hours),
      verified: true,
    };

    const products: ProductView[] = (raw?.products ?? [])
      // Never fabricate a React key — skip any id-less row rather than minting
      // a fresh UUID each render (which would break reconciliation/scroll).
      .filter((p: any) => p?.id !== null && p?.id !== undefined)
      .map(
        (p: any): ProductView => ({
          id: String(p.id),
          name: p.name ?? "Item",
          priceLabel: formatPrice(Number(p.price) || 0, currency),
          image: p.image ?? null,
          category: p.category ?? null,
          stock: (p.stock_bucket ?? null) as StockBucket | null,
        }),
      );

    return { store, products };
  },
);
