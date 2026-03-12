"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useWatchlist } from "@/hooks/use-watchlist";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PriceChange, formatPrice, formatVolume } from "@/components/markets/quote-helpers";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Eye, Plus, Star, Trash2, RefreshCw } from "lucide-react";
import type { Quote } from "@/lib/providers/types";
import { RefreshCountdown } from "@/components/refresh-countdown";

export default function WatchlistPage() {
  const { symbols, remove } = useWatchlist();
  const [quotes, setQuotes] = useState<Quote[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) {
      setQuotes([]);
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/quotes?symbols=${symbols.join(",")}`,
      );
      if (res.ok) {
        const json = await res.json();
        setQuotes(json.data || []);
      }
    } catch {
      // keep existing quotes on error
    } finally {
      setLoading(false);
    }
  }, [symbols]);

  // Fetch on mount + whenever symbols change
  useEffect(() => {
    fetchQuotes();
  }, [fetchQuotes]);

  if (symbols.length === 0) {
    return (
      <div className="gradient-mesh">
        <div className="mx-auto max-w-4xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
          <section>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <Eye className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
                <p className="text-muted-foreground">
                  Track your favorite stocks in one place
                </p>
              </div>
            </div>
          </section>

          <div className="py-16 text-center">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted/50">
              <Star className="h-10 w-10 text-muted-foreground/30" />
            </div>
            <h2 className="text-xl font-semibold mb-2">Your watchlist is empty</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start adding stocks to your watchlist by clicking the star icon on any
              stock page, or search for stocks to add.
            </p>
            <Link href="/">
              <Button size="lg" className="shadow-lg shadow-primary/25">
                <Plus className="mr-2 h-4 w-4" />
                Browse Markets
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="gradient-mesh">
      <div className="mx-auto max-w-5xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        <section className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <Eye className="h-6 w-6 text-primary" />
            </div>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Watchlist</h1>
            <p className="text-muted-foreground">
              {symbols.length} stock{symbols.length !== 1 ? "s" : ""} tracked
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <RefreshCountdown interval={30} onRefresh={fetchQuotes} loading={loading} />
          <Button variant="outline" size="sm" onClick={fetchQuotes} disabled={loading}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </Button>
        </div>
      </section>

      {/* Summary Cards */}
      {quotes.length > 0 && (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <SummaryCard
            label="Total Stocks"
            value={String(quotes.length)}
          />
          <SummaryCard
            label="Gainers"
            value={String(quotes.filter((q) => q.change > 0).length)}
            className="text-emerald-500"
          />
          <SummaryCard
            label="Losers"
            value={String(quotes.filter((q) => q.change < 0).length)}
            className="text-red-500"
          />
          <SummaryCard
            label="Avg Change"
            value={`${(quotes.reduce((s, q) => s + q.changePct, 0) / quotes.length).toFixed(2)}%`}
            className={
              quotes.reduce((s, q) => s + q.changePct, 0) >= 0
                ? "text-emerald-500"
                : "text-red-500"
            }
          />
        </div>
      )}

      {/* Quotes Table */}
      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Symbol</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead className="text-right">Change</TableHead>
              <TableHead className="hidden text-right sm:table-cell">Volume</TableHead>
              <TableHead className="hidden text-right md:table-cell">High</TableHead>
              <TableHead className="hidden text-right md:table-cell">Low</TableHead>
              <TableHead className="w-[60px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {quotes.map((q) => (
              <TableRow key={q.symbol} className="hover:bg-muted/50">
                <TableCell className="font-semibold">
                  <Link
                    href={`/stocks/${q.symbol}`}
                    className="hover:underline"
                  >
                    {q.symbol}
                  </Link>
                </TableCell>
                <TableCell className="text-right font-mono tabular-nums">
                  {formatPrice(q.price)}
                </TableCell>
                <TableCell className="text-right">
                  <PriceChange change={q.change} changePct={q.changePct} />
                </TableCell>
                <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">
                  {formatVolume(q.volume)}
                </TableCell>
                <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                  {formatPrice(q.high)}
                </TableCell>
                <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                  {formatPrice(q.low)}
                </TableCell>
                <TableCell>
                  <Button
                    variant="ghost"
                    size="icon-xs"
                    onClick={() => remove(q.symbol)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <Card className="overflow-hidden border-border/50 bg-gradient-to-br from-muted/30 to-transparent transition-all hover:shadow-md hover:border-border">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        <p className={`text-2xl font-bold tabular-nums ${className || ""}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
