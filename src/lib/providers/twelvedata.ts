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

const BASE_URL = "https://api.twelvedata.com";

function getApiKey(): string {
  const key = process.env.TWELVEDATA_API_KEY;
  if (!key) throw new Error("TWELVEDATA_API_KEY is not set");
  return key;
}

async function fetchTwelveData<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  const url = new URL(`${BASE_URL}${endpoint}`);
  url.searchParams.set("apikey", getApiKey());
  for (const [k, v] of Object.entries(params)) {
    url.searchParams.set(k, v);
  }

  const res = await fetch(url.toString(), {
    next: { revalidate: REVALIDATE.quotes },
    signal: AbortSignal.timeout(8000),
  });
  if (!res.ok) {
    throw new Error(`TwelveData ${endpoint} failed: ${res.status} ${res.statusText}`);
  }
  return res.json() as Promise<T>;
}

// ─── Twelve Data Response Types ─────────────────────────

interface TDQuote {
  symbol: string;
  name: string;
  exchange: string;
  close: string;
  change: string;
  percent_change: string;
  volume: string;
  high: string;
  low: string;
  open: string;
  previous_close: string;
  timestamp: number;
}

interface TDSearchResult {
  data: Array<{
    symbol: string;
    instrument_name: string;
    instrument_type: string;
    exchange: string;
  }>;
}

interface TDTimeSeries {
  values: Array<{
    datetime: string;
    open: string;
    high: string;
    low: string;
    close: string;
    volume: string;
  }>;
}

// ─── Provider Implementation ────────────────────────────

export const twelvedata: MarketDataProvider = {
  name: "twelvedata",

  async getQuote(symbol: string): Promise<Quote> {
    return cacheGetOrFetch(`td:quote:${symbol}`, REVALIDATE.quotes, async () => {
      const data = await fetchTwelveData<TDQuote>("/quote", { symbol });
      return {
        symbol: data.symbol,
        price: parseFloat(data.close),
        change: parseFloat(data.change),
        changePct: parseFloat(data.percent_change),
        volume: parseInt(data.volume, 10) || 0,
        high: parseFloat(data.high),
        low: parseFloat(data.low),
        open: parseFloat(data.open),
        prevClose: parseFloat(data.previous_close),
        timestamp: data.timestamp,
      };
    });
  },

  async searchSymbol(query: string): Promise<SymbolSearchResult[]> {
    return cacheGetOrFetch(`td:search:${query}`, REVALIDATE.search, async () => {
      const data = await fetchTwelveData<TDSearchResult>("/symbol_search", {
        symbol: query,
        outputsize: "10",
      });
      return (data.data || []).map((r) => ({
        symbol: r.symbol,
        name: r.instrument_name,
        type: r.instrument_type,
        exchange: r.exchange,
      }));
    });
  },

  async getCompanyProfile(symbol: string): Promise<CompanyProfileData> {
    void symbol;
    // Twelve Data free tier doesn't include company profile
    throw new Error("Company profile not available on Twelve Data free tier");
  },

  async getDailyBars(symbol: string, from: string, to: string): Promise<DailyBarData[]> {
    return cacheGetOrFetch(`td:bars:${symbol}:${from}:${to}`, REVALIDATE.profile, async () => {
      const data = await fetchTwelveData<TDTimeSeries>("/time_series", {
        symbol,
        interval: "1day",
        start_date: from,
        end_date: to,
        outputsize: "365",
      });
      return (data.values || [])
        .map((v) => ({
          date: v.datetime,
          open: parseFloat(v.open),
          high: parseFloat(v.high),
          low: parseFloat(v.low),
          close: parseFloat(v.close),
          volume: parseInt(v.volume, 10) || 0,
        }))
        .reverse();
    });
  },

  async getMarketNews(category?: string): Promise<MarketNewsItem[]> {
    void category;
    // Twelve Data free tier doesn't include news
    return [];
  },
};
