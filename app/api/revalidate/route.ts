import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";

/**
 * On-demand cache invalidation for a single storefront.
 *
 * The [slug] page (ISR) and the /api/storefront/[slug] route (s-maxage) are two
 * separate caches. When a merchant publishes, unpublishes, or edits their store,
 * call this so BOTH drop the stale copy immediately — otherwise an unpublished
 * store can linger on the CDN.
 *
 * Wire it from your Supabase side-effect / webhook after
 * rpc_save_storefront_settings succeeds:
 *
 *   POST /api/revalidate
 *   header: x-revalidate-secret: <REVALIDATE_SECRET>   (or in the JSON body)
 *   body:   { "slug": "dhawaaq-a1" }
 */
export async function POST(req: Request) {
  const secret = process.env.REVALIDATE_SECRET;

  let body: { slug?: string; secret?: string } | null = null;
  try {
    body = await req.json();
  } catch {
    // no/invalid body — handled below
  }

  const provided = body?.secret ?? req.headers.get("x-revalidate-secret");
  if (!secret || provided !== secret) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 });
  }

  const slug = String(body?.slug ?? "").trim().toLowerCase();
  if (slug.length < 3) {
    return NextResponse.json({ ok: false, error: "bad_slug" }, { status: 400 });
  }

  const paths = [`/${slug}`, `/api/storefront/${slug}`];
  for (const path of paths) revalidatePath(path);

  return NextResponse.json({ ok: true, revalidated: paths });
}
