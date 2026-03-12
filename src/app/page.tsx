import { Suspense } from "react";
import Link from "next/link";
import { marketData } from "@/lib/providers";
import { MarketTable } from "@/components/markets/market-table";
import { QuoteCard } from "@/components/markets/quote-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  BarChart3,
  Zap,
  Newspaper,
  GitCompareArrows,
  Eye,
  Briefcase,
} from "lucide-react";
import { formatPrice } from "@/components/markets/quote-helpers";
import type { Quote } from "@/lib/providers/types";

// Force dynamic rendering — data changes every few seconds
export const dynamic = "force-dynamic";

const TRENDING_SYMBOLS = [
  "AAPL", "MSFT", "GOOGL", "AMZN", "TSLA",
  "META", "NVDA", "JPM", "V", "JNJ",
];

const SECTOR_SYMBOLS: Record<string, string[]> = {
  tech: ["AAPL", "MSFT", "GOOGL", "META", "NVDA"],
  finance: ["JPM", "V", "MA", "BAC", "GS"],
  healthcare: ["JNJ", "UNH", "PFE", "ABBV", "MRK"],
};

function QuoteCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-[100px] rounded-lg" />
      ))}
    </div>
  );
}

function MarketTableSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 10 }).map((_, i) => (
        <Skeleton key={i} className="h-12 w-full rounded-md" />
      ))}
    </div>
  );
}

function GainersLosersSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} className="h-10 w-full rounded-md" />
      ))}
    </div>
  );
}

async function TrendingQuotes() {
  const quotes = await marketData.getQuotes(TRENDING_SYMBOLS);

  if (quotes.length === 0) {
    return (
      <div className="py-12 text-center text-muted-foreground">
        <p>Unable to load market data.</p>
        <p className="text-sm">Please check your API keys in .env.local</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5">
      {quotes.slice(0, 5).map((q) => (
        <QuoteCard key={q.symbol} quote={q} />
      ))}
    </div>
  );
}

async function SectorTable({ sector }: { sector: string }) {
  const symbols = SECTOR_SYMBOLS[sector] || TRENDING_SYMBOLS;
  const quotes = await marketData.getQuotes(symbols);
  return <MarketTable quotes={quotes} />;
}

async function FullMarketTable() {
  const quotes = await marketData.getQuotes(TRENDING_SYMBOLS);
  return <MarketTable quotes={quotes} />;
}

async function GainersLosers() {
  const quotes = await marketData.getQuotes(TRENDING_SYMBOLS);
  if (quotes.length === 0) return null;

  const sorted = [...quotes].sort((a, b) => b.changePct - a.changePct);
  const gainers = sorted.filter((q) => q.changePct > 0).slice(0, 5);
  const losers = sorted.filter((q) => q.changePct < 0).reverse().slice(0, 5);

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingUp className="h-4 w-4 text-emerald-500" />
            Top Gainers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pb-4">
          {gainers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No gainers today</p>
          ) : (
            gainers.map((q) => <MiniQuoteRow key={q.symbol} quote={q} />)
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="h-4 w-4 text-red-500" />
            Top Losers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 px-4 pb-4">
          {losers.length === 0 ? (
            <p className="text-sm text-muted-foreground">No losers today</p>
          ) : (
            losers.map((q) => <MiniQuoteRow key={q.symbol} quote={q} />)
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function MiniQuoteRow({ quote }: { quote: Quote }) {
  return (
    <Link
      href={`/stocks/${quote.symbol}`}
      className="flex items-center justify-between rounded-md px-2 py-1.5 transition-colors hover:bg-muted/50"
    >
      <span className="text-sm font-semibold">{quote.symbol}</span>
      <div className="flex items-center gap-3">
        <span className="text-sm font-mono tabular-nums">{formatPrice(quote.price)}</span>
        <Badge
          variant="secondary"
          className={
            quote.changePct >= 0
              ? "bg-emerald-500/10 text-emerald-500"
              : "bg-red-500/10 text-red-500"
          }
        >
          {quote.changePct >= 0 ? "+" : ""}
          {quote.changePct.toFixed(2)}%
        </Badge>
      </div>
    </Link>
  );
}

async function MarketPulse() {
  const quotes = await marketData.getQuotes(TRENDING_SYMBOLS);
  if (quotes.length === 0) return null;

  const avgChange =
    quotes.reduce((s, q) => s + q.changePct, 0) / quotes.length;
  const gainers = quotes.filter((q) => q.changePct > 0).length;
  const losers = quotes.filter((q) => q.changePct < 0).length;

  return (
    <div className="grid grid-cols-3 gap-3">
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Market Mood</p>
          <p
            className={`text-lg font-bold ${avgChange >= 0 ? "text-emerald-500" : "text-red-500"}`}
          >
            {avgChange >= 0 ? "Bullish" : "Bearish"}
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Gainers</p>
          <p className="text-lg font-bold text-emerald-500">{gainers}</p>
        </CardContent>
      </Card>
      <Card>
        <CardContent className="p-4 text-center">
          <p className="text-xs text-muted-foreground">Losers</p>
          <p className="text-lg font-bold text-red-500">{losers}</p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Hero */}
      <section>
        <div className="flex items-center gap-3 mb-2">
          <Zap className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              InvestSmart Dashboard
            </h1>
            <p className="text-muted-foreground">
              Real-time market data, portfolio tracking, and smart analytics
            </p>
          </div>
        </div>

        {/* Quick Action Cards */}
        <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          <QuickAction
            href="/watchlist"
            icon={<Eye className="h-5 w-5" />}
            label="Watchlist"
            desc="Track favorites"
          />
          <QuickAction
            href="/portfolio"
            icon={<Briefcase className="h-5 w-5" />}
            label="Portfolio"
            desc="Your holdings"
          />
          <QuickAction
            href="/compare"
            icon={<GitCompareArrows className="h-5 w-5" />}
            label="Compare"
            desc="Side by side"
          />
          <QuickAction
            href="/news"
            icon={<Newspaper className="h-5 w-5" />}
            label="News"
            desc="Market updates"
          />
        </div>
      </section>

      {/* Market Pulse */}
      <section>
        <Suspense
          fallback={
            <div className="grid grid-cols-3 gap-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 rounded-lg" />
              ))}
            </div>
          }
        >
          <MarketPulse />
        </Suspense>
      </section>

      {/* Trending Cards */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            Trending
          </h2>
        </div>
        <Suspense fallback={<QuoteCardsSkeleton />}>
          <TrendingQuotes />
        </Suspense>
      </section>

      {/* Gainers & Losers */}
      <section>
        <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          Top Movers
        </h2>
        <Suspense fallback={<GainersLosersSkeleton />}>
          <GainersLosers />
        </Suspense>
      </section>

      {/* Sector Tabs + Full Table */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <BarChart3 className="h-5 w-5 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Market Overview</h2>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="tech">Tech</TabsTrigger>
            <TabsTrigger value="finance">Finance</TabsTrigger>
            <TabsTrigger value="healthcare">Healthcare</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="mt-4">
            <Suspense fallback={<MarketTableSkeleton />}>
              <FullMarketTable />
            </Suspense>
          </TabsContent>
          <TabsContent value="tech" className="mt-4">
            <Suspense fallback={<MarketTableSkeleton />}>
              <SectorTable sector="tech" />
            </Suspense>
          </TabsContent>
          <TabsContent value="finance" className="mt-4">
            <Suspense fallback={<MarketTableSkeleton />}>
              <SectorTable sector="finance" />
            </Suspense>
          </TabsContent>
          <TabsContent value="healthcare" className="mt-4">
            <Suspense fallback={<MarketTableSkeleton />}>
              <SectorTable sector="healthcare" />
            </Suspense>
          </TabsContent>
        </Tabs>
      </section>
    </div>
  );
}

function QuickAction({
  href,
  icon,
  label,
  desc,
}: {
  href: string;
  icon: React.ReactNode;
  label: string;
  desc: string;
}) {
  return (
    <Link href={href}>
      <Card className="transition-all hover:shadow-md hover:border-primary/20 cursor-pointer">
        <CardContent className="flex items-center gap-3 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            {icon}
          </div>
          <div>
            <p className="text-sm font-semibold">{label}</p>
            <p className="text-xs text-muted-foreground">{desc}</p>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
