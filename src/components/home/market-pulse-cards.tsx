"use client";

import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

interface MarketPulseCardsProps {
  avgChange: number;
  gainers: number;
  losers: number;
  total: number;
}

const cardVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: {
      delay: i * 0.12,
      duration: 0.5,
      ease: [0.21, 0.47, 0.32, 0.98] as const,
    },
  }),
};

export function MarketPulseCards({
  avgChange,
  gainers,
  losers,
  total,
}: MarketPulseCardsProps) {
  const isBullish = avgChange >= 0;

  return (
    <div className="grid grid-cols-3 gap-4">
      <motion.div
        custom={0}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={cardVariants}
      >
        <Card className={cn(
          "relative overflow-hidden",
          isBullish
            ? "border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent"
            : "border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent",
        )}>
          <CardContent className="p-4 text-center">
            <div className={cn(
              "mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl",
              isBullish ? "bg-emerald-500/10" : "bg-red-500/10",
            )}>
              <Activity className={cn("h-5 w-5", isBullish ? "text-emerald-500" : "text-red-500")} />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Market Mood</p>
            <p
              className={cn(
                "mt-1 text-2xl font-bold",
                isBullish ? "text-emerald-500" : "text-red-500",
              )}
            >
              {isBullish ? "Bullish" : "Bearish"}
            </p>
            <p className={cn(
              "text-xs font-medium mt-1",
              isBullish ? "text-emerald-500/70" : "text-red-500/70",
            )}>
              {isBullish ? "+" : ""}{avgChange.toFixed(2)}% avg
            </p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        custom={1}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={cardVariants}
      >
        <Card className="relative overflow-hidden border-emerald-500/20 bg-gradient-to-br from-emerald-500/5 to-transparent">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Gainers</p>
            <p className="mt-1 text-2xl font-bold text-emerald-500">{gainers}</p>
            <p className="text-xs text-muted-foreground mt-1">of {total} tracked</p>
          </CardContent>
        </Card>
      </motion.div>

      <motion.div
        custom={2}
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true }}
        variants={cardVariants}
      >
        <Card className="relative overflow-hidden border-red-500/20 bg-gradient-to-br from-red-500/5 to-transparent">
          <CardContent className="p-4 text-center">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-red-500/10">
              <TrendingDown className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-xs font-medium text-muted-foreground">Losers</p>
            <p className="mt-1 text-2xl font-bold text-red-500">{losers}</p>
            <p className="text-xs text-muted-foreground mt-1">of {total} tracked</p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}
