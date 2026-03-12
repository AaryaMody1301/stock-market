import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, Newspaper, Building2, TrendingUp } from "lucide-react";
import { marketData } from "@/lib/providers";
import type {
  CompanyProfileData,
  DailyBarData,
  MarketNewsItem,
  Quote,
  SymbolSearchResult,
} from "@/lib/providers/types";
import { PriceChange, formatPrice, formatMarketCap } from "@/components/markets/quote-helpers";
import { ChartWithRange } from "@/components/charts/chart-with-range";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { WatchlistButton } from "@/components/watchlist-button";
import { AddToPortfolioButton } from "@/components/add-to-portfolio-button";

export const dynamic = "force-dynamic";

interface StockPageProps {
  params: Promise<{ symbol: string }>;
}

export async function generateMetadata({ params }: StockPageProps): Promise<Metadata> {
  const { symbol } = await params;
  const ticker = symbol.toUpperCase();
  return {
    title: `${ticker} Stock Price`,
    description: `Live price, chart, and company details for ${ticker}`,
  };
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-sm text-muted-foreground">{label}</p>
      <p className="font-semibold tabular-nums">{value}</p>
    </div>
  );
}

/* ── Presentation components (sync, receive pre-fetched data) ── */

function StockHeader({
  symbol,
  quote,
  profile,
}: {
  symbol: string;
  quote: Quote;
  profile: CompanyProfileData | null;
}) {
  return (
    <div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-3xl font-bold tracking-tight">{symbol}</h1>
          {profile?.industry && (
            <Badge variant="secondary">{profile.industry}</Badge>
          )}
        </div>
        <div className="flex items-center gap-2">
          <WatchlistButton symbol={symbol} />
          <AddToPortfolioButton symbol={symbol} currentPrice={quote.price} />
        </div>
      </div>
      {profile?.name && (
        <p className="mt-1 text-muted-foreground">{profile.name}</p>
      )}
      <div className="mt-4 flex items-baseline gap-4">
        <span className="text-4xl font-bold tabular-nums">
          {formatPrice(quote.price)}
        </span>
        <PriceChange
          change={quote.change}
          changePct={quote.changePct}
          className="text-lg"
        />
      </div>

      {/* Key Stats */}
      <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatItem label="Open" value={formatPrice(quote.open)} />
        <StatItem label="High" value={formatPrice(quote.high)} />
        <StatItem label="Low" value={formatPrice(quote.low)} />
        <StatItem label="Prev Close" value={formatPrice(quote.prevClose)} />
        {profile?.marketCap && profile.marketCap > 0 && (
          <StatItem label="Market Cap" value={formatMarketCap(profile.marketCap)} />
        )}
        {profile?.country && (
          <StatItem label="Country" value={profile.country} />
        )}
        {profile?.currency && (
          <StatItem label="Currency" value={profile.currency} />
        )}
      </div>
    </div>
  );
}

function StockChart({
  symbol,
  bars,
}: {
  symbol: string;
  bars: DailyBarData[];
}) {
  if (bars.length === 0) {
    return (
      <Card>
        <CardContent className="py-12 text-center text-muted-foreground">
          No chart data available for {symbol}.
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Price Chart</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartWithRange symbol={symbol} initialData={bars} />
      </CardContent>
    </Card>
  );
}

function CompanyAbout({
  symbol,
  profile,
}: {
  symbol: string;
  profile: CompanyProfileData | null;
}) {
  if (!profile?.description) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Building2 className="h-4 w-4" />
          About {profile.name || symbol}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed text-muted-foreground">
          {profile.description}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          {profile.sector && (
            <div>
              <span className="text-muted-foreground">Sector: </span>
              <span className="font-medium">{profile.sector}</span>
            </div>
          )}
          {profile.industry && (
            <div>
              <span className="text-muted-foreground">Industry: </span>
              <span className="font-medium">{profile.industry}</span>
            </div>
          )}
          {profile.website && (
            <div>
              <span className="text-muted-foreground">Website: </span>
              <a
                href={profile.website}
                target="_blank"
                rel="noopener noreferrer"
                className="font-medium text-primary hover:underline"
              >
                {new URL(profile.website).hostname}
              </a>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function StockNews({ news }: { news: MarketNewsItem[] }) {
  if (news.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <Newspaper className="h-4 w-4" />
          Latest News
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {news.slice(0, 5).map((item, i) => (
          <a
            key={`${item.url}-${i}`}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className="block rounded-md p-3 transition-colors hover:bg-accent"
          >
            <p className="text-sm font-medium leading-snug line-clamp-2">
              {item.headline}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {item.source} &middot;{" "}
              {new Date(item.publishedAt * 1000).toLocaleDateString()}
            </p>
          </a>
        ))}
      </CardContent>
    </Card>
  );
}

function RelatedStocks({
  related,
}: {
  related: SymbolSearchResult[];
}) {
  if (related.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-base">
          <TrendingUp className="h-4 w-4" />
          Related Stocks
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2">
          {related.map((r) => (
            <Link
              key={r.symbol}
              href={`/stocks/${r.symbol}`}
              className="inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm transition-colors hover:bg-accent"
            >
              <span className="font-medium">{r.symbol}</span>
              <span className="text-muted-foreground truncate max-w-[120px]">
                {r.name}
              </span>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

/* ── Main page: prefetch ALL data in one parallel batch ── */

export default async function StockPage({ params }: StockPageProps) {
  const { symbol: rawSymbol } = await params;
  const symbol = rawSymbol.toUpperCase();

  const today = new Date();
  const to = today.toISOString().slice(0, 10);
  const oneYearAgo = new Date(today);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  const from = oneYearAgo.toISOString().slice(0, 10);

  // Fire ALL external API calls in parallel — one round-trip, not 6 sequential ones
  const [quoteResult, profileResult, barsResult, newsResult] =
    await Promise.allSettled([
      marketData.getQuote(symbol),
      marketData.getCompanyProfile(symbol),
      marketData.getDailyBars(symbol, from, to),
      marketData.getCompanyNews(symbol),
    ]);

  const quote =
    quoteResult.status === "fulfilled" ? quoteResult.value : null;
  const profile =
    profileResult.status === "fulfilled" ? profileResult.value : null;
  const bars =
    barsResult.status === "fulfilled" ? barsResult.value : [];
  const news =
    newsResult.status === "fulfilled" ? newsResult.value : [];

  // All API calls failed — show not-found only if quote truly returned null/zero price
  // (not just a network error)
  if (!quote) {
    // If the quote call was rejected (API error), don't 404 — show degraded page
    if (quoteResult.status === "rejected") {
      return (
        <div className="mx-auto max-w-7xl space-y-8 px-4 py-16 sm:px-6 lg:px-8 text-center">
          <h1 className="text-2xl font-bold">{symbol}</h1>
          <p className="text-muted-foreground">
            Unable to load stock data right now. Please try again later.
          </p>
          <Link
            href="/"
            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Markets
          </Link>
        </div>
      );
    }
    notFound();
  }
  if (quote.price === 0) notFound();

  // Fetch related stocks (depends on profile.industry, so runs after the main batch)
  let related: SymbolSearchResult[] = [];
  if (profile?.industry) {
    try {
      const results = await marketData.searchSymbol(profile.industry);
      related = results
        .filter((r) => r.symbol !== symbol && r.type === "Common Stock")
        .slice(0, 5);
    } catch {
      // non-critical — leave empty
    }
  }

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      {/* Back Link */}
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Markets
      </Link>

      {/* Header + Stats */}
      <StockHeader symbol={symbol} quote={quote} profile={profile} />

      <Separator />

      {/* Chart with time range */}
      <StockChart symbol={symbol} bars={bars} />

      {/* Company About */}
      <CompanyAbout symbol={symbol} profile={profile} />

      {/* Two-column: News + Related */}
      <div className="grid gap-6 lg:grid-cols-2">
        <StockNews news={news} />
        <RelatedStocks related={related} />
      </div>
    </div>
  );
}
