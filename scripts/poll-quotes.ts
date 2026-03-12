/**
 * Quote Polling Worker
 * Runs as a standalone process via PM2.
 * Fetches latest quotes for configured symbols and stores them in PostgreSQL.
 *
 * Usage: npx tsx scripts/poll-quotes.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { finnhub } from "../src/lib/providers/finnhub";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const POLL_INTERVAL = parseInt(process.env.POLL_INTERVAL_MS || "15000", 10);
const SYMBOLS = (process.env.POLL_SYMBOLS || "AAPL,MSFT,GOOGL").split(",").map((s) => s.trim());

async function ensureSymbolsExist(tickers: string[]) {
  for (const ticker of tickers) {
    await db.symbol.upsert({
      where: { ticker },
      update: {},
      create: {
        ticker,
        name: ticker, // Will be enriched by profile fetch
        exchange: "US",
      },
    });
  }
}

async function pollOnce() {
  const startedAt = new Date();
  const jobRun = await db.jobRun.create({
    data: { jobName: "poll-quotes", status: "running", startedAt },
  });

  try {
    const symbolRecords = await db.symbol.findMany({
      where: { ticker: { in: SYMBOLS }, isActive: true },
    });

    const symbolMap = new Map(symbolRecords.map((s) => [s.ticker, s.id]));

    let successCount = 0;
    for (const ticker of SYMBOLS) {
      try {
        const quote = await finnhub.getQuote(ticker);
        const symbolId = symbolMap.get(ticker);
        if (!symbolId) continue;

        await db.quoteSnapshot.create({
          data: {
            symbolId,
            price: quote.price,
            change: quote.change,
            changePct: quote.changePct,
            volume: quote.volume,
            high: quote.high,
            low: quote.low,
            open: quote.open,
            prevClose: quote.prevClose,
            timestamp: new Date(quote.timestamp * 1000),
          },
        });
        successCount++;
      } catch (err) {
        console.error(`  [FAIL] ${ticker}:`, err instanceof Error ? err.message : err);
      }
    }

    await db.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "success",
        endedAt: new Date(),
        metadata: { symbolsPolled: SYMBOLS.length, succeeded: successCount },
      },
    });

    console.log(
      `[${new Date().toISOString()}] Polled ${successCount}/${SYMBOLS.length} symbols`,
    );
  } catch (err) {
    await db.jobRun.update({
      where: { id: jobRun.id },
      data: {
        status: "failed",
        endedAt: new Date(),
        error: err instanceof Error ? err.message : String(err),
      },
    });
    console.error(`[${new Date().toISOString()}] Poll failed:`, err);
  }
}

async function main() {
  console.log(`Starting quote poller — interval ${POLL_INTERVAL}ms, symbols: ${SYMBOLS.join(", ")}`);
  await ensureSymbolsExist(SYMBOLS);
  await pollOnce(); // First run immediately
  setInterval(pollOnce, POLL_INTERVAL);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
