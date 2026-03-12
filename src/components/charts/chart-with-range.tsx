"use client";

import { useEffect, useState, useCallback } from "react";
import { PriceChart } from "@/components/charts/price-chart";
import { Skeleton } from "@/components/ui/skeleton";
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

export function ChartWithRange({ symbol, initialData }: ChartWithRangeProps) {
  const [range, setRange] = useState<TimeRange>("1Y");
  const [data, setData] = useState<Bar[]>(initialData);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(
    async (r: TimeRange) => {
      if (r === "1Y") {
        setData(initialData);
        return;
      }
      setLoading(true);
      try {
        const rangeDays = RANGES.find((x) => x.label === r)!.days;
        const to = new Date().toISOString().slice(0, 10);
        const from = new Date(
          Date.now() - rangeDays * 24 * 60 * 60 * 1000,
        )
          .toISOString()
          .slice(0, 10);

        const res = await fetch(
          `/api/compare?symbols=${symbol}`,
        );
        if (res.ok) {
          const json = await res.json();
          const match = (json.data as { symbol: string; bars: Bar[] }[])?.find(
            (d) => d.symbol === symbol,
          );
          const allBars = match?.bars || [];
          // Filter bars by date range client-side
          const filtered = allBars.filter((b) => b.date >= from && b.date <= to);
          setData(filtered.length > 0 ? filtered : allBars);
        }
      } catch {
        // keep existing data
      } finally {
        setLoading(false);
      }
    },
    [symbol, initialData],
  );

  useEffect(() => {
    if (range !== "1Y") {
      fetchData(range);
    }
  }, [range, fetchData]);

  return (
    <div className="space-y-3">
      {/* Range selector */}
      <div className="flex gap-1">
        {RANGES.map(({ label }) => (
          <button
            key={label}
            onClick={() => setRange(label)}
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
      {loading ? (
        <Skeleton className="h-[400px] w-full rounded-lg" />
      ) : data.length > 0 ? (
        <PriceChart data={data} />
      ) : (
        <div className="flex h-[400px] items-center justify-center text-muted-foreground">
          No data for this time range
        </div>
      )}
    </div>
  );
}
