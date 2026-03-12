"use client";

import Link from "next/link";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { PriceChange, formatPrice, formatVolume } from "./quote-helpers";
import { MiniSparkline } from "@/components/charts/mini-sparkline";
import type { Quote } from "@/lib/providers/types";

function syntheticSparkline(q: Quote): number[] {
  // Create a mini price path from OHLC to show intraday direction
  return [q.open, (q.open + q.high) / 2, q.low, (q.high + q.low) / 2, q.price];
}

interface MarketTableProps {
  quotes: Quote[];
}

export function MarketTable({ quotes }: MarketTableProps) {
  if (quotes.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        No market data available.
      </div>
    );
  }

  return (
    <div className="rounded-lg border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]" scope="col">Symbol</TableHead>
            <TableHead className="text-right" scope="col">Price</TableHead>
            <TableHead className="text-right" scope="col">Change</TableHead>
            <TableHead className="hidden sm:table-cell" scope="col">Trend</TableHead>
            <TableHead className="hidden text-right sm:table-cell" scope="col">Open</TableHead>
            <TableHead className="hidden text-right md:table-cell" scope="col">High</TableHead>
            <TableHead className="hidden text-right md:table-cell" scope="col">Low</TableHead>
            <TableHead className="hidden text-right lg:table-cell" scope="col">Volume</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {quotes.map((q) => (
            <TableRow
              key={q.symbol}
              className="cursor-pointer transition-colors hover:bg-muted/50"
            >
              <TableCell className="font-semibold">
                <Link
                  href={`/stocks/${q.symbol}`}
                  className="block hover:underline"
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
              <TableCell className="hidden sm:table-cell">
                <MiniSparkline prices={syntheticSparkline(q)} />
              </TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums sm:table-cell">
                {formatPrice(q.open)}
              </TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                {formatPrice(q.high)}
              </TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums md:table-cell">
                {formatPrice(q.low)}
              </TableCell>
              <TableCell className="hidden text-right font-mono tabular-nums lg:table-cell">
                {formatVolume(q.volume)}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
