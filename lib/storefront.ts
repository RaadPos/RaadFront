/**
 * Storefront view models + pure helpers.
 *
 * Safe to import from BOTH server and client components — no Supabase/secret
 * dependency lives here. The actual data access is in `lib/storefront.service.ts`
 * (server-only). Client components only ever see these sanitized shapes.
 */

export type StockBucket = "in" | "low" | "out";

/* ── Opening hours ─────────────────────────────────────────────────────── */

export type DayKey = "mon" | "tue" | "wed" | "thu" | "fri" | "sat" | "sun";

export interface DayHours {
  open: string | null; // "08:00"
  close: string | null; // "22:00"
  closed: boolean;
}

export type StoreHours = Record<DayKey, DayHours>;

/** Public store profile shown in the header (nothing sensitive). */
export interface StoreView {
  name: string;
  address: string | null;
  whatsapp: string | null;
  logoUrl: string | null;
  coverUrl: string | null;
  currency: string | null;
  hours: StoreHours;
  verified: boolean;
}

/** Public product tile data. */
export interface ProductView {
  id: string;
  name: string;
  priceLabel: string;
  image: string | null;
  category: string | null;
  stock: StockBucket | null;
}

export interface Storefront {
  store: StoreView;
  products: ProductView[];
}

/** Format a numeric price using the store currency (ISO code or plain prefix). */
export function formatPrice(price: number, currency: string | null): string {
  if (currency) {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: Number.isInteger(price) ? 0 : 2,
      }).format(price);
    } catch {
      return `${currency} ${price.toLocaleString()}`;
    }
  }
  return price.toLocaleString();
}

/** WhatsApp click-to-chat link for a store (null when no number is set). */
export function buildWaLink(store: StoreView): string | null {
  if (!store.whatsapp) return null;
  const digits = store.whatsapp.replace(/\D/g, "");
  if (!digits) return null;
  const text = `Hi ${store.name}, I saw your catalog and want to buy something.`;
  return `https://wa.me/${digits}?text=${encodeURIComponent(text)}`;
}

/**
 * Two-letter product initials for the no-image placeholder — mirrors the
 * Flutter app's `_getProductInitials`: first letter upper-case, next letter
 * lower-case (falling back to the second word or "p").
 */
export function productInitials(name: string): string {
  const trimmed = (name ?? "").trim();
  if (!trimmed) return "Pr";
  const words = trimmed.split(/\s+/);
  const first = words[0] ?? "";
  if (!first) return "Pr";
  let initials = first[0].toUpperCase();
  if (first.length > 1) initials += first[1].toLowerCase();
  else if (words.length > 1 && words[1]) initials += words[1][0].toLowerCase();
  else initials += "p";
  return initials;
}

/* ── Opening-hours helpers ─────────────────────────────────────────────── */

const DAY_KEYS: DayKey[] = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"];
// JS Date.getDay(): 0=Sun … 6=Sat
const DOW_KEYS: DayKey[] = ["sun", "mon", "tue", "wed", "thu", "fri", "sat"];
const DOW_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const EMPTY_DAY: DayHours = { open: null, close: null, closed: false };

/** Normalise the RPC's `hours_json` object into a full 7-day record. */
export function parseHours(raw: unknown): StoreHours {
  const src = raw && typeof raw === "object" ? (raw as Record<string, any>) : {};
  const out = {} as StoreHours;
  for (const k of DAY_KEYS) {
    const e = src[k];
    if (e && typeof e === "object") {
      if (e.closed === true) out[k] = { open: null, close: null, closed: true };
      else if (typeof e.open === "string" && typeof e.close === "string")
        out[k] = { open: e.open, close: e.close, closed: false };
      else out[k] = { ...EMPTY_DAY };
    } else {
      out[k] = { ...EMPTY_DAY };
    }
  }
  return out;
}

/** True when the merchant has configured at least one day (open interval or closed flag). */
export function hasAnyHours(h: StoreHours): boolean {
  return DAY_KEYS.some(
    (k) => h[k].closed || (h[k].open != null && h[k].close != null),
  );
}

export interface OpenStatus {
  open: boolean;
  /** e.g. "Closes 10:00 PM" | "Opens 8:00 AM" | "Opens tomorrow 9:00 AM" | null */
  detail: string | null;
}

function toMinutes(hhmm: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

function fmtTime(minutes: number): string {
  const total = ((minutes % 1440) + 1440) % 1440;
  let h = Math.floor(total / 60);
  const m = total % 60;
  const period = h < 12 ? "AM" : "PM";
  h = h % 12 || 12;
  return `${h}:${String(m).padStart(2, "0")} ${period}`;
}

/**
 * Compute open/closed for `now` from the weekly hours. Handles overnight
 * intervals (close ≤ open rolls to the next day) and finds the next opening
 * within the coming week when currently closed.
 */
export function computeOpenStatus(hours: StoreHours, now: Date): OpenStatus {
  // Per JS weekday: interval in minutes; close may exceed 1440 for overnight.
  const parsed = DOW_KEYS.map((key) => {
    const d = hours[key];
    if (!d || d.closed || d.open == null || d.close == null) return null;
    const o = toMinutes(d.open);
    const cRaw = toMinutes(d.close);
    if (o == null || cRaw == null) return null;
    return { o, c: cRaw <= o ? cRaw + 1440 : cRaw };
  });

  const dow = now.getDay();
  const nowMin = now.getHours() * 60 + now.getMinutes();

  // Open now — today's interval.
  const today = parsed[dow];
  if (today && nowMin >= today.o && nowMin < today.c) {
    return { open: true, detail: `Closes ${fmtTime(today.c)}` };
  }
  // Open now — yesterday's interval spilling past midnight.
  const yday = parsed[(dow + 6) % 7];
  if (yday && yday.c > 1440 && nowMin < yday.c - 1440) {
    return { open: true, detail: `Closes ${fmtTime(yday.c - 1440)}` };
  }

  // Closed — find the next opening within the coming week.
  for (let i = 0; i < 7; i++) {
    const idx = (dow + i) % 7;
    const p = parsed[idx];
    if (!p) continue;
    if (i === 0) {
      if (nowMin < p.o) return { open: false, detail: `Opens ${fmtTime(p.o)}` };
      continue; // already past today's close
    }
    const when = i === 1 ? "tomorrow" : DOW_NAMES[idx];
    return { open: false, detail: `Opens ${when} ${fmtTime(p.o)}` };
  }
  return { open: false, detail: null };
}

/** Filter rail options: "All" followed by categories in first-seen order. */
export function deriveCategories(products: ProductView[]): string[] {
  const seen = new Set<string>();
  const categories: string[] = [];
  for (const p of products) {
    if (p.category && !seen.has(p.category)) {
      seen.add(p.category);
      categories.push(p.category);
    }
  }
  return ["All", ...categories];
}
