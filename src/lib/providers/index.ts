import { finnhub, getCompanyNews } from "./finnhub";
import { twelvedata } from "./twelvedata";
import type { MarketDataProvider, Quote, SymbolSearchResult, CompanyProfileData, DailyBarData, MarketNewsItem } from "./types";

export type { Quote, SymbolSearchResult, CompanyProfileData, DailyBarData, MarketNewsItem } from "./types";

/**
 * Unified market data service with automatic fallback.
 * Primary: Finnhub | Backup: Twelve Data
 */
class MarketDataService {
  private primary: MarketDataProvider = finnhub;
  private backup: MarketDataProvider = twelvedata;

  private async withFallback<T>(
    fn: (provider: MarketDataProvider) => Promise<T>,
  ): Promise<T> {
    try {
      return await fn(this.primary);
    } catch (primaryErr) {
      console.warn(`[MarketData] ${this.primary.name} failed, trying ${this.backup.name}:`,
        primaryErr instanceof Error ? primaryErr.message : primaryErr);
      return fn(this.backup);
    }
  }

  async getQuote(symbol: string): Promise<Quote> {
    return this.withFallback((p) => p.getQuote(symbol));
  }

  async getQuotes(symbols: string[]): Promise<Quote[]> {
    const results = await Promise.allSettled(
      symbols.map((s) => this.getQuote(s)),
    );
    return results
      .filter((r): r is PromiseFulfilledResult<Quote> => r.status === "fulfilled")
      .map((r) => r.value);
  }

  async searchSymbol(query: string): Promise<SymbolSearchResult[]> {
    return this.withFallback((p) => p.searchSymbol(query));
  }

  async getCompanyProfile(symbol: string): Promise<CompanyProfileData> {
    // Only Finnhub supports this on free tier — timeout-protected
    try {
      return await finnhub.getCompanyProfile(symbol);
    } catch (err) {
      console.warn(`[MarketData] getCompanyProfile(${symbol}) failed:`,
        err instanceof Error ? err.message : err);
      throw err;
    }
  }

  async getDailyBars(symbol: string, from: string, to: string): Promise<DailyBarData[]> {
    return this.withFallback((p) => p.getDailyBars(symbol, from, to));
  }

  async getMarketNews(category?: string): Promise<MarketNewsItem[]> {
    return finnhub.getMarketNews(category);
  }

  async getCompanyNews(symbol: string): Promise<MarketNewsItem[]> {
    return getCompanyNews(symbol);
  }
}

export const marketData = new MarketDataService();
