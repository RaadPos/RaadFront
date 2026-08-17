import { productInitials } from "@/lib/storefront";

/**
 * Self-contained stand-ins for missing images. They render tasteful
 * gradient/text placeholders so the page looks complete when a store or
 * product has no photo. Real photos are rendered with a plain <img> instead.
 */

/** Square brand logo tile — shows the store's initial as a monogram. */
export function LogoSlot({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-ink to-[#334155] text-white">
      <span className="text-[22px] font-extrabold leading-none tracking-tight">
        {name.charAt(0).toUpperCase()}
      </span>
    </div>
  );
}

/**
 * Product thumbnail placeholder — the product's two-letter initials in grey on
 * a soft grey field (matching the Flutter app's no-image card).
 */
export function ProductSlot({ name }: { name: string }) {
  return (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#F5F6F8] to-[#E9ECF1]">
      <span className="select-none text-3xl font-extrabold tracking-[0.08em] text-slate-400">
        {productInitials(name)}
      </span>
    </div>
  );
}
