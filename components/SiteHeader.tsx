import { hasAnyHours, type StoreView } from "@/lib/storefront";
import { LogoSlot } from "@/components/ImageSlot";
import { OpenStatus } from "@/components/OpenStatus";
import { VerifiedBadge, WhatsAppIcon, MapPinIcon } from "@/components/icons";

/**
 * Brand header: logo/cover thumbnail + store name + verified badge, an inline
 * "Online · address" line, and a primary WhatsApp action — aligned to the
 * full-width page gutter. Data-driven from a StoreView.
 */
export function SiteHeader({
  store,
  waLink,
}: {
  store: StoreView;
  waLink: string | null;
}) {
  return (
    <header className="w-full px-gutter pt-[22px]">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Identity */}
        <div className="flex min-w-0 items-center gap-[14px]">
          <div className="h-[52px] w-[52px] flex-shrink-0 overflow-hidden rounded-[10px] border border-[#E8EAEE] shadow-logo">
            {store.logoUrl ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={store.logoUrl}
                alt={`${store.name} logo`}
                className="h-full w-full object-cover"
              />
            ) : (
              <LogoSlot name={store.name} />
            )}
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-[7px]">
              <span className="truncate text-[22px] font-extrabold tracking-[-0.02em]">
                {store.name}
              </span>
              {store.verified && (
                <VerifiedBadge width={18} height={18} className="flex-shrink-0" />
              )}
            </div>
            <div className="mt-1 flex flex-wrap items-center gap-2 text-[12.5px]">
              {hasAnyHours(store.hours) ? (
                <OpenStatus hours={store.hours} />
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  <span className="h-2 w-2 animate-pulseDot rounded-full bg-good" />
                  <span className="font-bold text-good">Online</span>
                </span>
              )}
              {store.address && (
                <>
                  <span className="text-[#D1D5DB]">·</span>
                  <span className="inline-flex min-w-0 items-center gap-1 font-medium text-muted">
                    <MapPinIcon width={13} height={13} className="flex-shrink-0" />
                    <span className="truncate">{store.address}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Primary action */}
        {waLink && (
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-shrink-0 items-center gap-[9px] rounded-brand bg-brand-grad px-5 py-3 text-sm font-bold text-white shadow-cta transition hover:brightness-110 hover:text-white"
          >
            <WhatsAppIcon />
            Chat with us
          </a>
        )}
      </div>
    </header>
  );
}
