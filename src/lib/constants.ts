/** Market hours for US exchanges (Eastern Time) */
export const US_MARKET = {
  openHour: 9,
  openMinute: 30,
  closeHour: 16,
  closeMinute: 0,
  timezone: "America/New_York",
} as const;

/** Finnhub free-tier rate limit: 60 calls/minute */
export const FINNHUB_RATE_LIMIT = 60;

/** Twelve Data free-tier rate limit: 800 calls/day, 8/minute */
export const TWELVEDATA_RATE_LIMIT_PER_MINUTE = 8;
export const TWELVEDATA_RATE_LIMIT_PER_DAY = 800;

/** Default number of symbols displayed on the homepage */
export const DEFAULT_PAGE_SIZE = 20;

/** Cache revalidation intervals (seconds) */
export const REVALIDATE = {
  quotes: 15,
  search: 300,
  profile: 86400,
  news: 600,
} as const;
