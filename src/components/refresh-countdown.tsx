"use client";

import { useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";

interface RefreshCountdownProps {
  /** Interval in seconds between refreshes */
  interval: number;
  /** Called when countdown reaches 0 */
  onRefresh: () => void;
  /** Is a refresh currently in progress? */
  loading?: boolean;
}

export function RefreshCountdown({
  interval,
  onRefresh,
  loading = false,
}: RefreshCountdownProps) {
  const [remaining, setRemaining] = useState(() => interval);

  useEffect(() => {
    const id = setInterval(() => {
      setRemaining((prev) => {
        if (prev <= 1) {
          onRefresh();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [interval, onRefresh]);

  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground" role="timer" aria-live="off">
      <RefreshCw
        className={`h-3 w-3 ${loading ? "animate-spin" : ""}`}
        aria-hidden="true"
      />
      <span>
        {loading ? "Refreshing…" : `Next update in ${remaining}s`}
      </span>
    </div>
  );
}
