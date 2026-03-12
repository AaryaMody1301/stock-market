"use client";

import { cn } from "@/lib/utils";

interface MiniSparklineProps {
  prices: number[];
  width?: number;
  height?: number;
  className?: string;
}

/**
 * Lightweight SVG sparkline for inline use in tables and cards.
 * Renders a simple polyline from an array of prices.
 */
export function MiniSparkline({
  prices,
  width = 80,
  height = 28,
  className,
}: MiniSparklineProps) {
  if (prices.length < 2) return null;

  const min = Math.min(...prices);
  const max = Math.max(...prices);
  const range = max - min || 1;

  const points = prices
    .map((p, i) => {
      const x = (i / (prices.length - 1)) * width;
      const y = height - ((p - min) / range) * (height - 2) - 1;
      return `${x},${y}`;
    })
    .join(" ");

  const isUp = prices[prices.length - 1] >= prices[0];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      className={cn("inline-block", className)}
    >
      <polyline
        points={points}
        fill="none"
        stroke={isUp ? "#22c55e" : "#ef4444"}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
