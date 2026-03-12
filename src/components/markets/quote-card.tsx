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
          "transition-all hover:shadow-md hover:border-primary/20",
          className,
        )}
      >
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-semibold">{quote.symbol}</p>
              <p className="mt-1 text-xl font-bold tabular-nums">
                {formatPrice(quote.price)}
              </p>
            </div>
            <div
              className={cn(
                "rounded-md px-2 py-1 text-xs font-medium",
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
