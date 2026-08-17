import { NextResponse } from "next/server";
import { getStorefrontBySlug } from "@/lib/storefront.service";

/**
 * Public storefront API: GET /api/storefront/<slug>
 *
 * Runs on the server only. Calls the read service (which talks to Supabase with
 * a server-only key) and returns ONLY sanitized public JSON — business profile
 * + products. No key, no business_id lookup logic, and nothing sensitive is
 * ever exposed. Safe for the browser, the Flutter app, or any external caller.
 */
export async function GET(
  _req: Request,
  { params }: { params: { slug: string } },
) {
  const data = await getStorefrontBySlug(params.slug);

  if (!data) {
    return NextResponse.json(
      { ok: false, error: "not_found" },
      { status: 404 },
    );
  }

  return NextResponse.json(
    { ok: true, ...data },
    {
      status: 200,
      headers: {
        // CDN-friendly: cache 60s, serve stale up to 5 min while revalidating.
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    },
  );
}
