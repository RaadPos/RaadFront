"use client";

import { useMemo, useState } from "react";
import { deriveCategories, type ProductView } from "@/lib/storefront";
import { CatalogControls } from "@/components/CatalogControls";
import { ProductGrid } from "@/components/ProductGrid";

/**
 * Interactive slice of the storefront: derives the category rail from the live
 * products and owns the active-category filter state. Thin client boundary —
 * it receives already-fetched, sanitized product data as props (no secrets, no
 * data access here), so the header and FAB stay server-rendered.
 */
export function Storefront({ products }: { products: ProductView[] }) {
  const categories = useMemo(() => deriveCategories(products), [products]);
  const [active, setActive] = useState<string>("All");

  const visible = useMemo(
    () =>
      active === "All"
        ? products
        : products.filter((p) => p.category === active),
    [active, products],
  );

  return (
    <>
      <CatalogControls
        categories={categories}
        active={active}
        onSelect={setActive}
      />
      <ProductGrid products={visible} />
    </>
  );
}
