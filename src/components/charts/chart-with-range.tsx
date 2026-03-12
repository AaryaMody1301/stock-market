"use client";

import { useState } from "react";
import { PriceChart } from "@/components/charts/price-chart";
import { cn } from "@/lib/utils";

type TimeRange = "1W" | "1M" | "3M" | "6M" | "1Y";

const RANGES: { label: TimeRange; days: number }[] = [
  { label: "1W", days: 7 },
  { label: "1M", days: 30 },
  { label: "3M", days: 90 },
  { label: "6M", days: 180 },
  { label: "1Y", days: 365 },
];

interface Bar {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume?: number;
}

interface ChartWithRangeProps {
  symbol: string;
  initialData: Bar[];
}

function filterByRange(bars: Bar[], range: TimeRange): Bar[] {
  if (range === "1Y") return bars;
  const rangeDays = RANGES.find((x) => x.label === range)!.days;
  const cutoff = new Date(Date.now() - rangeDays * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const filtered = bars.filter((b) => b.date >= cutoff);
  return filtered.length > 0 ? filtered : bars;
}

export function ChartWithRange({ initialData }: ChartWithRangeProps) {
  const [range, setRange] = useState<TimeRange>("1Y");
  const [data, setData] = useState<Bar[]>(initialData);

  function handleRangeChange(newRange: TimeRange) {
    setRange(newRange);
    setData(filterByRange(initialData, newRange));
  }

  return (
    <div className="space-y-3">
      {/* Range selector */}
      <div className="flex gap-1">
        {RANGES.map(({ label }) => (
          <button
            key={label}
            onClick={() => handleRangeChange(label)}
            className={cn(
              "rounded-md px-3 py-1 text-xs font-medium transition-colors",
              range === label
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-muted-foreground hover:bg-accent hover:text-foreground",
            )}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Chart */}
      {data.length > 0 ? (
        <PriceChart data={data} />
      ) : (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
          No data for this time range
        </div>
      )}
    </div>
  );
}
