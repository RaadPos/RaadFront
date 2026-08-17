import { WhatsAppIcon } from "@/components/icons";

/**
 * Fixed glassmorphic help bar pinned to the bottom of the viewport, centred on
 * the page. Renders nothing when the store has no WhatsApp number. Text
 * truncates and paddings stay tight so it never overflows a narrow phone.
 */
export function ContactFab({ waLink }: { waLink: string | null }) {
  if (!waLink) return null;

  return (
    <div className="pointer-events-none fixed bottom-[22px] left-1/2 z-[60] w-[calc(100%-32px)] max-w-fab -translate-x-1/2">
      <div className="pointer-events-auto flex items-center justify-between gap-3 rounded-brand border border-white/70 bg-white/[0.72] py-2 pl-4 pr-2 shadow-fab backdrop-blur-2xl sm:gap-3.5 sm:pl-[22px]">
        <div className="min-w-0">
          <p className="truncate text-[13.5px] font-bold text-ink sm:text-[14.5px]">
            Need help buying?
          </p>
          <p className="truncate text-[11px] text-muted sm:text-xs">
            We usually reply in minutes
          </p>
        </div>
        <a
          href={waLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex flex-shrink-0 items-center gap-2 rounded-brand bg-brand-grad px-4 py-3 text-white shadow-ctaFab transition hover:brightness-110 hover:text-white sm:px-5 sm:py-[13px]"
        >
          <WhatsAppIcon width={16} height={16} className="sm:h-[18px] sm:w-[18px]" />
          <span className="whitespace-nowrap text-[13.5px] font-bold sm:text-[14.5px]">
            Contact Store
          </span>
        </a>
      </div>
    </div>
  );
}
