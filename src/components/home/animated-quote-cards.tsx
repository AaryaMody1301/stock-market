"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { PriceChange, formatPrice } from "@/components/markets/quote-helpers";
import type { Quote } from "@/lib/providers/types";
import { cn } from "@/lib/utils";

interface AnimatedQuoteCardsProps {
  quotes: Quote[];
}

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.95 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      delay: i * 0.1,
      duration: 0.4,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

export function AnimatedQuoteCards({ quotes }: AnimatedQuoteCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-5">
      {quotes.map((quote, i) => {
        const isPositive = quote.change >= 0;
        return (
          <motion.div
            key={quote.symbol}
            custom={i}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-30px" }}
            variants={cardVariants}
          >
            <Link href={`/stocks/${quote.symbol}`}>
              <Card
                className={cn(
                  "group relative overflow-hidden transition-all duration-300",
                  "hover:shadow-lg hover:shadow-primary/5 hover:-translate-y-1 hover:border-primary/30",
                  isPositive
                    ? "border-emerald-500/10 hover:border-emerald-500/30"
                    : "border-red-500/10 hover:border-red-500/30",
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
                        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold">
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
          </motion.div>
        );
      })}
    </div>
  );
}
