"use client";

import { useEffect, useState } from "react";
import { US_MARKET } from "@/lib/constants";

type MarketStatus = "open" | "closed" | "pre-market" | "after-hours";

function getMarketStatus(): MarketStatus {
  const now = new Date();
  const et = new Date(
    now.toLocaleString("en-US", { timeZone: US_MARKET.timezone }),
  );
  const day = et.getDay();
  const h = et.getHours();
  const m = et.getMinutes();
  const mins = h * 60 + m;
  const openMins = US_MARKET.openHour * 60 + US_MARKET.openMinute; // 570
  const closeMins = US_MARKET.closeHour * 60 + US_MARKET.closeMinute; // 960

  // Weekend
  if (day === 0 || day === 6) return "closed";

  if (mins >= openMins && mins < closeMins) return "open";
  if (mins >= 400 && mins < openMins) return "pre-market"; // 4:00 AM – 9:30 AM
  if (mins >= closeMins && mins < 1200) return "after-hours"; // 4:00 PM – 8:00 PM
  return "closed";
}

const STATUS_CONFIG: Record<MarketStatus, { label: string; color: string }> = {
  open: { label: "Market Open", color: "bg-green-500" },
  closed: { label: "Market Closed", color: "bg-red-500" },
  "pre-market": { label: "Pre-Market", color: "bg-amber-500" },
  "after-hours": { label: "After Hours", color: "bg-blue-500" },
};

export function MarketStatusIndicator() {
  const [status, setStatus] = useState<MarketStatus>(() => getMarketStatus());

  useEffect(() => {
    const id = setInterval(() => setStatus(getMarketStatus()), 60_000);
    return () => clearInterval(id);
  }, []);

  const { label, color } = STATUS_CONFIG[status];

  return (
    <div className="flex items-center gap-1.5 text-xs text-muted-foreground" aria-live="polite">
      <span className={`h-2 w-2 rounded-full ${color} animate-pulse`} aria-hidden="true" />
      <span className="hidden sm:inline">{label}</span>
    </div>
  );
}
