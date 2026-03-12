import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { PriceChange, formatPrice } from "./quote-helpers";
import type { Quote } from "@/lib/providers/types";
import { cn } from "@/lib/utils";

interface QuoteCardProps {
  quote: Quote;
  className?: string;
}

export function QuoteCard({ quote, className }: QuoteCardProps) {
  const isPositive = quote.change >= 0;

  return (
    <Link href={`/stocks/${quote.symbol}`}>
      <Card
        className={cn(
          "group relative overflow-hidden transition-all duration-300",
          "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
          isPositive
            ? "border-emerald-500/10 hover:border-emerald-500/30"
            : "border-red-500/10 hover:border-red-500/30",
          className,
        )}
      >
        {/* Gradient accent at top */}
        <div
          className={cn(
            "absolute inset-x-0 top-0 h-0.5",
            isPositive
              ? "bg-gradient-to-r from-emerald-500/60 via-emerald-500 to-emerald-500/60"
              : "bg-gradient-to-r from-red-500/60 via-red-500 to-red-500/60",
          )}
        />
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold transition-transform duration-300 group-hover:scale-110">
                  {quote.symbol.slice(0, 2)}
                </div>
                <p className="text-sm font-semibold">{quote.symbol}</p>
              </div>
              <p className="mt-2 text-xl font-bold tabular-nums">
                {formatPrice(quote.price)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-semibold",
                isPositive
                  ? "bg-emerald-500/10 text-emerald-500"
                  : "bg-red-500/10 text-red-500",
              )}
            >
              {isPositive ? "+" : ""}
              {quote.changePct.toFixed(2)}%
            </div>
          </div>
          <div className="mt-2">
            <PriceChange
              change={quote.change}
              changePct={quote.changePct}
              className="text-sm"
            />
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
