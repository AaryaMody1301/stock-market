/** Shared types for all market data providers */

export interface Quote {
  symbol: string;
  price: number;
  change: number;
  changePct: number;
  volume: number;
  high: number;
  low: number;
  open: number;
  prevClose: number;
  timestamp: number; // Unix seconds
}

export interface SymbolSearchResult {
  symbol: string;
  name: string;
  type: string;
  exchange: string;
}

export interface CompanyProfileData {
  ticker: string;
  name: string;
  logo: string;
  industry: string;
  sector: string;
  marketCap: number;
  website: string;
  description: string;
  country: string;
  currency: string;
}

export interface DailyBarData {
  date: string; // YYYY-MM-DD
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface MarketNewsItem {
  headline: string;
  summary: string;
  source: string;
  url: string;
  imageUrl: string;
  category: string;
  publishedAt: number; // Unix seconds
}

export interface MarketDataProvider {
  name: string;
  getQuote(symbol: string): Promise<Quote>;
  searchSymbol(query: string): Promise<SymbolSearchResult[]>;
  getCompanyProfile(symbol: string): Promise<CompanyProfileData>;
  getDailyBars(symbol: string, from: string, to: string): Promise<DailyBarData[]>;
  getMarketNews(category?: string): Promise<MarketNewsItem[]>;
}
