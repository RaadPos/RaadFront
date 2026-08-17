"use client";

import { useEffect, useState } from "react";
import { computeOpenStatus, type OpenStatus as Status, type StoreHours } from "@/lib/storefront";

/**
 * Live open/closed indicator computed from the store's weekly hours against the
 * visitor's local time (matching how the Flutter app uses device time — no
 * store timezone is stored). Recomputes every minute. Renders a neutral
 * placeholder until mounted to avoid an SSR/timezone hydration mismatch.
 */
export function OpenStatus({ hours }: { hours: StoreHours }) {
  const [status, setStatus] = useState<Status | null>(null);

  useEffect(() => {
    const tick = () => setStatus(computeOpenStatus(hours, new Date()));
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, [hours]);

  if (!status) {
    return (
      <span className="inline-flex items-center gap-1.5">
        <span className="h-2 w-2 rounded-full bg-slate-300" />
        <span className="font-bold text-muted">Hours</span>
      </span>
    );
  }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className={`h-2 w-2 rounded-full ${
          status.open ? "animate-pulseDot bg-good" : "bg-slate-400"
        }`}
      />
      <span className={`font-bold ${status.open ? "text-good" : "text-muted"}`}>
        {status.open ? "Open now" : "Closed"}
      </span>
      {status.detail && (
        <span className="font-medium text-muted">· {status.detail}</span>
      )}
    </span>
  );
}
