"use client";

import { SearchIcon } from "@/components/icons";

/**
 * Sticky catalog controls: the "Our Products" heading, a search field, and the
 * scrollable category filter rail (categories are derived from the live data).
 * Glassmorphic bar spanning the viewport, content aligned to the page gutter.
 */
export function CatalogControls({
  categories,
  active,
  onSelect,
}: {
  categories: string[];
  active: string;
  onSelect: (category: string) => void;
}) {
  return (
    <div className="sticky top-0 z-40 mt-[22px] border-b border-slate-900/[0.07] bg-canvas/80 backdrop-blur-lg">
      <div className="w-full px-gutter py-3.5">
        <div className="flex flex-wrap items-center gap-3.5">
          <h2 className="whitespace-nowrap text-[19px] font-extrabold tracking-[-0.02em]">
            Our Products
          </h2>
          {/* Search (visual — wire to real search when available) */}
          <button
            type="button"
            className="flex w-full items-center gap-2 rounded-brand border border-[#E8EAEE] bg-white px-4 py-2.5 text-left sm:ml-auto sm:w-auto sm:min-w-[min(300px,100%)] sm:flex-1"
          >
            <SearchIcon width={17} height={17} className="text-[#9AA1AB]" />
            <span className="text-[13.5px] font-medium text-[#9AA1AB]">
              Search for products...
            </span>
          </button>
        </div>

        {/* Category rail (only shown when there's more than just "All") */}
        {categories.length > 1 && (
          <div className="noscroll mt-3 flex gap-2.5 overflow-x-auto pb-0.5">
            {categories.map((category) => {
              const isActive = category === active;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => onSelect(category)}
                  className={[
                    "flex-shrink-0 whitespace-nowrap rounded-brand border px-[18px] py-2.5 text-[13.5px] font-bold transition-all duration-150",
                    isActive
                      ? "border-transparent bg-brand-grad text-white shadow-[0_2px_10px_rgba(2,12,90,0.32)]"
                      : "border-[#E5E7EB] bg-white text-[#374151] hover:border-[#D1D5DB] hover:bg-slate-50",
                  ].join(" ")}
                >
                  {category}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
