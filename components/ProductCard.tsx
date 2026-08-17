import type { ProductView, StockBucket } from "@/lib/storefront";
import { ProductSlot } from "@/components/ImageSlot";

/**
 * Product tile: image, category kicker, title, then a bottom row pairing the
 * price with a stock label. Gentle lift on hover. Real photos render as an
 * <img>; products without a photo fall back to a category-glyph placeholder.
 */
const STOCK_LABEL: Record<StockBucket, string> = {
  in: "In Stock",
  low: "Only a few left",
  out: "Out of Stock",
};

export function ProductCard({ product }: { product: ProductView }) {
  return (
    <article className="flex flex-col rounded-brand border border-line bg-white p-3 shadow-card transition-transform duration-200 ease-out hover:-translate-y-0.5 hover:shadow-cardHover">
      <div className="relative h-[176px] overflow-hidden rounded-brand bg-[#F3F4F6]">
        {product.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover"
          />
        ) : (
          <ProductSlot name={product.name} />
        )}
      </div>

      {product.category && (
        <p className="mx-[3px] mt-3.5 text-[10.5px] font-bold uppercase tracking-[0.09em] text-brand">
          {product.category}
        </p>
      )}

      <p className="mx-[3px] mt-[5px] line-clamp-2 min-h-[38px] text-[15px] font-bold leading-[1.28] text-ink">
        {product.name}
      </p>

      <div className="mt-auto flex items-center justify-between gap-2 pt-3">
        <span className="text-[17px] font-extrabold tracking-[-0.01em] text-ink">
          {product.priceLabel}
        </span>
        {product.stock && (
          <span className="whitespace-nowrap py-1.5 text-[11.5px] font-bold text-muted">
            {STOCK_LABEL[product.stock]}
          </span>
        )}
      </div>
    </article>
  );
}
