import type { SVGProps } from "react";

/**
 * Icon set for the storefront. SVGs are lifted straight from the source design
 * so strokes / paths stay pixel-faithful, wrapped as typed React components.
 */

type IconProps = SVGProps<SVGSVGElement>;

/** Verified blue check badge next to the store name. */
export function VerifiedBadge({ width = 20, height = 20, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} {...props}>
      <circle cx="12" cy="12" r="10" fill="#020C5A" />
      <path
        d="M7 12.4l3.2 3.2L17 8.6"
        fill="none"
        stroke="#fff"
        strokeWidth="2.3"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/** Location pin used on the address card. */
export function MapPinIcon({ width = 22, height = 22, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

/** WhatsApp glyph for the chat / contact buttons. */
export function WhatsAppIcon({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" width={width} height={height} fill="currentColor" {...props}>
      <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91C21.95 6.45 17.5 2 12.04 2zm5.8 14.16c-.24.68-1.4 1.3-1.94 1.38-.5.07-1.13.1-1.82-.11-.42-.13-.96-.31-1.65-.61-2.9-1.25-4.8-4.17-4.94-4.36-.14-.19-1.18-1.57-1.18-2.99s.75-2.12 1.01-2.41c.27-.29.58-.36.77-.36l.55.01c.18.01.42-.07.65.5.24.58.82 2 .89 2.15.07.14.12.31.02.5-.09.19-.14.31-.28.48-.14.17-.29.38-.42.51-.14.14-.28.29-.12.57.16.28.72 1.18 1.55 1.91 1.06.95 1.95 1.24 2.23 1.38.28.14.44.12.6-.07.16-.19.69-.8.87-1.08.18-.28.36-.23.61-.14.25.09 1.58.75 1.85.89.27.14.45.2.52.31.07.11.07.65-.17 1.33z" />
    </svg>
  );
}

/** Search glyph for the sticky search field. */
export function SearchIcon({ width = 18, height = 18, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={width}
      height={height}
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      {...props}
    >
      <circle cx="11" cy="11" r="7" />
      <path d="M21 21l-4-4" />
    </svg>
  );
}

/* --- Category glyphs, used inside product image placeholders --- */

function PhoneGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="7" y="2" width="10" height="20" rx="2.5" />
      <path d="M11 5.5h2" />
    </svg>
  );
}

function AudioGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M4 14v-2a8 8 0 0 1 16 0v2" />
      <rect x="3" y="14" width="4" height="6" rx="1.5" />
      <rect x="17" y="14" width="4" height="6" rx="1.5" />
    </svg>
  );
}

function AccessoryGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="7" width="18" height="12" rx="2.5" />
      <path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  );
}

/** Fallback glyph for unknown categories (a shopping bag). */
function DefaultGlyph(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M6 7h12l-1 13H7L6 7z" />
      <path d="M9 7a3 3 0 0 1 6 0" />
    </svg>
  );
}

/** Pick an outline glyph from a free-form category string (keyword match). */
export function CategoryGlyph({
  category,
  ...props
}: IconProps & { category: string | null }) {
  const key = (category ?? "").toLowerCase();
  let Glyph = DefaultGlyph;
  if (key.includes("phone") || key.includes("mobile")) Glyph = PhoneGlyph;
  else if (key.includes("audio") || key.includes("headphone") || key.includes("sound") || key.includes("earbud"))
    Glyph = AudioGlyph;
  else if (key.includes("accessor") || key.includes("charger") || key.includes("cable"))
    Glyph = AccessoryGlyph;
  return <Glyph {...props} />;
}
