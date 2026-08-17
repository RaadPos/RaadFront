import type { ProductView } from "@/lib/storefront";
import { ProductCard } from "@/components/ProductCard";

/**
 * Responsive auto-fill product grid, aligned to the full-width page gutter.
 * Columns grow with the viewport; bottom padding clears the fixed contact FAB.
 */
export function ProductGrid({ products }: { products: ProductView[] }) {
  return (
    <section className="w-full px-gutter pb-[130px] pt-6">
      {products.length === 0 ? (
        <div className="pt-6 text-center text-sm text-muted">
          No products in this category yet.
        </div>
      ) : (
        <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-[18px]">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
