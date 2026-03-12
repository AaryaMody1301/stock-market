"use client";

import { cn } from "@/lib/utils";
import type { Quote } from "@/lib/providers/types";

interface TickerTapeProps {
  quotes: Quote[];
  className?: string;
  speed?: number;
}

export function TickerTape({ quotes, className, speed = 30 }: TickerTapeProps) {
  if (quotes.length === 0) return null;

  // Double the items for seamless loop
  const items = [...quotes, ...quotes];
  const duration = quotes.length * speed;

  return (
    <div
      className={cn(
        "relative overflow-hidden border-b border-border/40 bg-muted/30 backdrop-blur-sm",
        className,
      )}
      aria-hidden="true"
    >
      <div
        className="flex animate-ticker whitespace-nowrap py-2"
        style={{
          animationDuration: `${duration}s`,
        }}
      >
        {items.map((q, i) => (
          <div
            key={`${q.symbol}-${i}`}
            className="mx-6 inline-flex items-center gap-2 text-sm"
          >
            <span className="font-semibold">{q.symbol}</span>
            <span className="font-mono tabular-nums">${q.price.toFixed(2)}</span>
            <span
              className={cn(
                "font-mono tabular-nums text-xs font-medium",
                q.changePct >= 0 ? "text-emerald-500" : "text-red-500",
              )}
            >
              {q.changePct >= 0 ? "+" : ""}
              {q.changePct.toFixed(2)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
