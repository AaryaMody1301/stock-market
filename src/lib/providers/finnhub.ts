import { cacheGetOrFetch } from "@/lib/cache";
import { REVALIDATE } from "@/lib/constants";
import type {
  CompanyProfileData,
  DailyBarData,
  MarketDataProvider,
  MarketNewsItem,
  Quote,
  SymbolSearchResult,
} from "./types";

const BASE_URL = "https://finnhub.io/api/v1";

function getApiKey(): string {
  const key = process.env.FINNHUB_API_KEY;
  if (!key) throw new Error("FINNHUB_API_KEY is not set");
  return key;
}

async function fetchFinnhub<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("token", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE.quotes },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`Finnhub ${endpoint} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Finnhub Response Types ─────────────────────────────

interface FinnhubQuote {
  c: number;  // current
  d: number;  // change
  dp: number; // change percent
  h: number;  // high
  l: number;  // low
  o: number;  // open
  pc: number; // prev close
  t: number;  // timestamp
}

interface FinnhubSearchResult {
  count: number;
  result: Array<{
    description: string;
    displaySymbol: string;
    symbol: string;
    type: string;
  }>;
}

interface FinnhubProfile {
  ticker: string;
  name: string;
  logo: string;
  finnhubIndustry: string;
  marketCapitalization: number;
  weburl: string;
  country: string;
  currency: string;
}

interface FinnhubCandle {
  c: number[];
  h: number[];
  l: number[];
  o: number[];
  v: number[];
  t: number[];
  s: string;
}

interface FinnhubNewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  image: string;
  category: string;
  datetime: number;
}

// ─── Provider Implementation ────────────────────────────

export const finnhub: MarketDataProvider = {
  name: "finnhub",

  async getQuote(symbol: string): Promise<Quote> {
    return cacheGetOrFetch(`finnhub:quote:${symbol}`, REVALIDATE.quotes, async () => {
      const data = await fetchFinnhub<FinnhubQuote>("/quote", { symbol });
      return {
        symbol,
        price: data.c ?? 0,
        change: data.d ?? 0,
        changePct: data.dp ?? 0,
        volume: 0, // Finnhub /quote doesn't include volume
        high: data.h ?? 0,
        low: data.l ?? 0,
        open: data.o ?? 0,
        prevClose: data.pc ?? 0,
        timestamp: data.t ?? 0,
      };
    });
  },

  async searchSymbol(query: string): Promise<SymbolSearchResult[]> {
    return cacheGetOrFetch(`finnhub:search:${query}`, REVALIDATE.search, async () => {
      const data = await fetchFinnhub<FinnhubSearchResult>("/search", { q: query });
      return data.result
        .filter((r) => r.type === "Common Stock")
        .slice(0, 10)
        .map((r) => ({
          symbol: r.symbol,
          name: r.description,
          type: r.type,
          exchange: "US",
        }));
    });
  },

  async getCompanyProfile(symbol: string): Promise<CompanyProfileData> {
    return cacheGetOrFetch(`finnhub:profile:${symbol}`, REVALIDATE.profile, async () => {
      const data = await fetchFinnhub<FinnhubProfile>("/stock/profile2", { symbol });
      return {
        ticker: data.ticker,
        name: data.name,
        logo: data.logo,
        industry: data.finnhubIndustry,
        sector: data.finnhubIndustry,
        marketCap: data.marketCapitalization * 1_000_000,
        website: data.weburl,
        description: "",
        country: data.country,
        currency: data.currency,
      };
    });
  },

  async getDailyBars(symbol: string, from: string, to: string): Promise<DailyBarData[]> {
    return cacheGetOrFetch(`finnhub:candle:${symbol}:${from}:${to}`, REVALIDATE.profile, async () => {
      const fromTs = Math.floor(new Date(from).getTime() / 1000).toString();
      const toTs = Math.floor(new Date(to).getTime() / 1000).toString();

      const data = await fetchFinnhub<FinnhubCandle>("/stock/candle", {
        symbol,
        resolution: "D",
        from: fromTs,
        to: toTs,
      });

      if (data.s === "no_data" || !data.c) return [];

      return data.t.map((t, i) => ({
        date: new Date(t * 1000).toISOString().slice(0, 10),
        open: data.o[i],
        high: data.h[i],
        low: data.l[i],
        close: data.c[i],
        volume: data.v[i],
      }));
    });
  },

  async getMarketNews(category = "general"): Promise<MarketNewsItem[]> {
    return cacheGetOrFetch(`finnhub:news:${category}`, REVALIDATE.news, async () => {
      const data = await fetchFinnhub<FinnhubNewsItem[]>("/news", { category });
      return data.slice(0, 20).map((n) => ({
        headline: n.headline,
        summary: n.summary,
        source: n.source,
        url: n.url,
        imageUrl: n.image,
        category: n.category,
        publishedAt: n.datetime,
      }));
    });
  },
};

/** Fetch company-specific news from Finnhub (not part of the generic provider interface) */
export async function getCompanyNews(
  symbol: string,
): Promise<MarketNewsItem[]> {
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  return cacheGetOrFetch(`finnhub:company-news:${symbol}`, REVALIDATE.news, async () => {
    const data = await fetchFinnhub<FinnhubNewsItem[]>("/company-news", {
      symbol,
      from,
      to,
    });
    return data.slice(0, 10).map((n) => ({
      headline: n.headline,
      summary: n.summary,
      source: n.source,
      url: n.url,
      imageUrl: n.image,
      category: n.category,
      publishedAt: n.datetime,
    }));
  });
}
