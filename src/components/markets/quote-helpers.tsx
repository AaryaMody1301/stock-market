import { cn } from "@/lib/utils";

interface PriceChangeProps {
  change: number;
  changePct: number;
  className?: string;
}

export function PriceChange({ change, changePct, className }: PriceChangeProps) {
  const isPositive = change >= 0;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 font-medium",
        isPositive ? "text-emerald-500" : "text-red-500",
        className,
      )}
    >
      {isPositive ? "+" : ""}
      {change.toFixed(2)} ({isPositive ? "+" : ""}
      {changePct.toFixed(2)}%)
    </span>
  );
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(price);
}

export function formatVolume(volume: number): string {
  if (volume >= 1_000_000_000) return `${(volume / 1_000_000_000).toFixed(1)}B`;
  if (volume >= 1_000_000) return `${(volume / 1_000_000).toFixed(1)}M`;
  if (volume >= 1_000) return `${(volume / 1_000).toFixed(1)}K`;
  return volume.toString();
}

export function formatMarketCap(cap: number): string {
  if (cap >= 1_000_000_000_000) return `$${(cap / 1_000_000_000_000).toFixed(2)}T`;
  if (cap >= 1_000_000_000) return `$${(cap / 1_000_000_000).toFixed(2)}B`;
  if (cap >= 1_000_000) return `$${(cap / 1_000_000).toFixed(2)}M`;
  return `$${cap.toFixed(0)}`;
}


