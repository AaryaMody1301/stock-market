import { normalizeStockSymbol } from "@/lib/symbols";
import type {
  CompanyProfileData,
  DailyBarData,
  MarketDataProvider,
  MarketNewsItem,
  Quote,
  SymbolSearchResult,
} from "./types";

interface DemoInstrument {
  symbol: string;
  name: string;
  sector: string;
  industry: string;
  basePrice: number;
  exchange: string;
}

const DEMO_TIMESTAMP = Math.floor(Date.parse("2026-08-28T20:00:00Z") / 1000);

const INSTRUMENTS: DemoInstrument[] = [
  { symbol: "DEMO", name: "StockPulse Demo Corp.", sector: "Demo Sector", industry: "Synthetic Demo Data", basePrice: 125, exchange: "DEMO" },
  { symbol: "AAPL", name: "Apple Inc.", sector: "Technology", industry: "Consumer Electronics", basePrice: 228, exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft Corporation", sector: "Technology", industry: "Software", basePrice: 515, exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet Inc.", sector: "Technology", industry: "Internet Services", basePrice: 205, exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon.com, Inc.", sector: "Consumer", industry: "Internet Retail", basePrice: 231, exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla, Inc.", sector: "Consumer", industry: "Automobiles", basePrice: 347, exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms, Inc.", sector: "Technology", industry: "Internet Services", basePrice: 748, exchange: "NASDAQ" },
  { symbol: "NVDA", name: "NVIDIA Corporation", sector: "Technology", industry: "Semiconductors", basePrice: 184, exchange: "NASDAQ" },
  { symbol: "JPM", name: "JPMorgan Chase & Co.", sector: "Financial Services", industry: "Banks", basePrice: 286, exchange: "NYSE" },
  { symbol: "V", name: "Visa Inc.", sector: "Financial Services", industry: "Payments", basePrice: 351, exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard Incorporated", sector: "Financial Services", industry: "Payments", basePrice: 584, exchange: "NYSE" },
  { symbol: "BAC", name: "Bank of America Corporation", sector: "Financial Services", industry: "Banks", basePrice: 51, exchange: "NYSE" },
  { symbol: "GS", name: "The Goldman Sachs Group, Inc.", sector: "Financial Services", industry: "Capital Markets", basePrice: 778, exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 174, exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group Incorporated", sector: "Healthcare", industry: "Healthcare Plans", basePrice: 332, exchange: "NYSE" },
  { symbol: "PFE", name: "Pfizer Inc.", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 27, exchange: "NYSE" },
  { symbol: "ABBV", name: "AbbVie Inc.", sector: "Healthcare", industry: "Biotechnology", basePrice: 211, exchange: "NYSE" },
  { symbol: "MRK", name: "Merck & Co., Inc.", sector: "Healthcare", industry: "Pharmaceuticals", basePrice: 86, exchange: "NYSE" },
];

const BY_SYMBOL = new Map(INSTRUMENTS.map((instrument) => [instrument.symbol, instrument]));

function hashText(value: string): number {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function round(value: number, digits = 2): number {
  const factor = 10 ** digits;
  return Math.round(value * factor) / factor;
}

function instrumentFor(rawSymbol: string): DemoInstrument {
  const symbol = normalizeStockSymbol(rawSymbol);
  const known = BY_SYMBOL.get(symbol);
  if (known) return known;

  return {
    symbol,
    name: `${symbol} Demo Company`,
    sector: "Demo Sector",
    industry: "Synthetic Demo Data",
    basePrice: 40 + (hashText(symbol) % 26000) / 100,
    exchange: "DEMO",
  };
}

function quoteFor(rawSymbol: string): Quote {
  const instrument = instrumentFor(rawSymbol);
  const changePct = ((hashText(`${instrument.symbol}:change`) % 701) - 350) / 100;
  const prevClose = instrument.basePrice / (1 + changePct / 100);
  const change = instrument.basePrice - prevClose;
  const intraday = 0.008 + (hashText(`${instrument.symbol}:range`) % 120) / 10000;

  return {
    symbol: instrument.symbol,
    price: round(instrument.basePrice),
    change: round(change),
    changePct: round(changePct),
    volume: 500_000 + (hashText(`${instrument.symbol}:volume`) % 12_000_000),
    high: round(instrument.basePrice * (1 + intraday)),
    low: round(instrument.basePrice * (1 - intraday)),
    open: round(prevClose * (1 + ((hashText(`${instrument.symbol}:open`) % 101) - 50) / 10000)),
    prevClose: round(prevClose),
    timestamp: DEMO_TIMESTAMP,
  };
}

function dateRange(from: string, to: string): string[] {
  const start = new Date(`${from}T00:00:00.000Z`);
  const end = new Date(`${to}T00:00:00.000Z`);
  if (!Number.isFinite(start.getTime()) || !Number.isFinite(end.getTime()) || start > end) return [];

  const dates: string[] = [];
  const cursor = new Date(start);
  let examined = 0;
  while (cursor <= end && examined < 2500) {
    const day = cursor.getUTCDay();
    if (day !== 0 && day !== 6) dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
    examined += 1;
  }
  return dates;
}

function barsFor(rawSymbol: string, from: string, to: string): DailyBarData[] {
  const instrument = instrumentFor(rawSymbol);
  const dates = dateRange(from, to);
  const divisor = Math.max(1, dates.length - 1);

  return dates.map((date, index) => {
    const progress = index / divisor;
    const cycle = Math.sin(index / 8 + (hashText(instrument.symbol) % 11)) * 0.022;
    const noise = ((hashText(`${instrument.symbol}:${date}`) % 1001) - 500) / 50000;
    const close = instrument.basePrice * (0.88 + 0.12 * progress + cycle + noise);
    const openNoise = ((hashText(`${date}:${instrument.symbol}:open`) % 401) - 200) / 20000;
    const open = close * (1 + openNoise);
    const range = 0.006 + (hashText(`${instrument.symbol}:${date}:range`) % 120) / 10000;

    return {
      date,
      open: round(open),
      high: round(Math.max(open, close) * (1 + range)),
      low: round(Math.min(open, close) * (1 - range)),
      close: round(close),
      volume: 400_000 + (hashText(`${instrument.symbol}:${date}:volume`) % 14_000_000),
    };
  });
}

function demoNews(scope: string): MarketNewsItem[] {
  const normalized = scope.toUpperCase();
  return [
    {
      headline: `${normalized}: synthetic earnings-review scenario`,
      summary: "Demo-only headline used to exercise StockPulse research and evidence interfaces. It is not a real news report.",
      source: "StockPulse Demo",
      url: `https://example.com/stockpulse-demo/${normalized.toLowerCase()}/earnings-review`,
      imageUrl: "",
      category: "demo",
      publishedAt: DEMO_TIMESTAMP - 3600,
    },
    {
      headline: `${normalized}: synthetic risk-monitoring scenario`,
      summary: "Deterministic fixture content for reviewer testing. No live news provider was contacted.",
      source: "StockPulse Demo",
      url: `https://example.com/stockpulse-demo/${normalized.toLowerCase()}/risk-monitoring`,
      imageUrl: "",
      category: "demo",
      publishedAt: DEMO_TIMESTAMP - 86_400,
    },
    {
      headline: `${normalized}: synthetic capital-allocation scenario`,
      summary: "Fixture data designed to demonstrate UI behavior without redistribution of third-party market content.",
      source: "StockPulse Demo",
      url: `https://example.com/stockpulse-demo/${normalized.toLowerCase()}/capital-allocation`,
      imageUrl: "",
      category: "demo",
      publishedAt: DEMO_TIMESTAMP - 172_800,
    },
  ];
}

export const demoMarketData: MarketDataProvider = {
  name: "demo",

  async getQuote(symbol: string): Promise<Quote> {
    return quoteFor(symbol);
  },

  async searchSymbol(query: string): Promise<SymbolSearchResult[]> {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return [];
    return INSTRUMENTS
      .filter((instrument) =>
        instrument.symbol.toLowerCase().includes(normalized) ||
        instrument.name.toLowerCase().includes(normalized) ||
        instrument.industry.toLowerCase().includes(normalized) ||
        instrument.sector.toLowerCase().includes(normalized),
      )
      .slice(0, 10)
      .map((instrument) => ({
        symbol: instrument.symbol,
        name: instrument.name,
        type: "Common Stock (Demo)",
        exchange: instrument.exchange,
      }));
  },

  async getCompanyProfile(symbol: string): Promise<CompanyProfileData> {
    const instrument = instrumentFor(symbol);
    return {
      ticker: instrument.symbol,
      name: instrument.name,
      logo: "",
      industry: instrument.industry,
      sector: instrument.sector,
      marketCap: round(instrument.basePrice * (1_000_000_000 + (hashText(`${instrument.symbol}:shares`) % 4_000_000_000))),
      website: `https://example.com/stockpulse-demo/${instrument.symbol.toLowerCase()}`,
      description: "Synthetic StockPulse demo profile. Company identity is used only to make the reviewer workflow recognizable; displayed market figures are deterministic fixtures, not live or historical market data.",
      country: "US",
      currency: "USD",
    };
  },

  async getDailyBars(symbol: string, from: string, to: string): Promise<DailyBarData[]> {
    return barsFor(symbol, from, to);
  },

  async getMarketNews(category = "general"): Promise<MarketNewsItem[]> {
    return demoNews(category || "general");
  },
};

export async function getDemoCompanyNews(symbol: string): Promise<MarketNewsItem[]> {
  return demoNews(normalizeStockSymbol(symbol));
}

export const demoFixtures = {
  timestamp: DEMO_TIMESTAMP,
  instruments: INSTRUMENTS.map((instrument) => ({ ...instrument })),
};
