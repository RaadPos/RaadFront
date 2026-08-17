import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getStorefrontBySlug } from "@/lib/storefront.service";
import { buildWaLink } from "@/lib/storefront";
import { SiteHeader } from "@/components/SiteHeader";
import { Storefront } from "@/components/Storefront";
import { ContactFab } from "@/components/ContactFab";

/**
 * Public storefront resolved entirely from the URL slug.
 *
 * The slug is the address; the visitor never sees (or can query) a business_id.
 * Data comes from a server-to-server RPC call — the Supabase URL and anon key
 * live only in server env vars and are never shipped to the browser. The HTML
 * sent to the client contains only the sanitized public product data.
 */

// Cache the rendered HTML for 60s (ISR). Dev always renders fresh.
export const revalidate = 60;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const data = await getStorefrontBySlug(params.slug);
  if (!data) return { title: "Store not found" };

  const { store } = data;
  return {
    title: `${store.name} — Live Inventory`,
    description: `Browse ${store.name}'s catalog and order via WhatsApp.`,
    openGraph: {
      title: store.name,
      images: store.coverUrl
        ? [store.coverUrl]
        : store.logoUrl
          ? [store.logoUrl]
          : [],
    },
  };
}

export default async function StorefrontSlugPage({
  params,
}: {
  params: { slug: string };
}) {
  const data = await getStorefrontBySlug(params.slug);
  if (!data) notFound();

  const { store, products } = data;
  const waLink = buildWaLink(store);

  return (
    <main className="min-h-screen w-full bg-canvas">
      <SiteHeader store={store} waLink={waLink} />
      <Storefront products={products} />
      <ContactFab waLink={waLink} />
    </main>
  );
}
