import assert from "node:assert/strict";
import test from "node:test";
import { assertLiveMarketDataAllowed, isDemoMode } from "../src/lib/demo-mode";
import { marketData } from "../src/lib/providers";

test("demo mode accepts explicit truthy values only", () => {
  assert.equal(isDemoMode({ STOCKPULSE_DEMO_MODE: "true" }), true);
  assert.equal(isDemoMode({ STOCKPULSE_DEMO_MODE: "1" }), true);
  assert.equal(isDemoMode({ STOCKPULSE_DEMO_MODE: "YES" }), true);
  assert.equal(isDemoMode({ STOCKPULSE_DEMO_MODE: "false" }), false);
  assert.equal(isDemoMode({}), false);
});

test("live market access guard fails closed in demo mode", () => {
  assert.throws(
    () => assertLiveMarketDataAllowed({ STOCKPULSE_DEMO_MODE: "true" }),
    /Live market-data access is disabled/,
  );
});

test("demo market provider is deterministic and performs no fetch calls", async () => {
  const originalMode = process.env.STOCKPULSE_DEMO_MODE;
  const originalFetch = globalThis.fetch;
  process.env.STOCKPULSE_DEMO_MODE = "true";
  globalThis.fetch = (async () => {
    throw new Error("network access attempted in demo mode");
  }) as typeof fetch;

  try {
    const first = await marketData.getQuote("AAPL");
    const second = await marketData.getQuote("AAPL");
    assert.deepEqual(first, second);

    const bars = await marketData.getDailyBars("AAPL", "2026-08-01", "2026-08-31");
    assert.ok(bars.length > 10);
    assert.ok(bars.every((bar) => {
      const day = new Date(`${bar.date}T00:00:00.000Z`).getUTCDay();
      return day !== 0 && day !== 6;
    }));

    const search = await marketData.searchSymbol("Apple");
    assert.equal(search[0]?.symbol, "AAPL");

    const news = await marketData.getCompanyNews("AAPL");
    assert.ok(news.length > 0);
    assert.ok(news.every((item) => item.source === "StockPulse Demo"));
  } finally {
    globalThis.fetch = originalFetch;
    if (originalMode === undefined) delete process.env.STOCKPULSE_DEMO_MODE;
    else process.env.STOCKPULSE_DEMO_MODE = originalMode;
  }
});
