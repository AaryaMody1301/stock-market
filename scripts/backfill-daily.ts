/**
 * Daily Bar Backfill Script
 * Fetches historical daily OHLCV data for all active symbols.
 * Run once on setup, then schedule weekly via cron.
 *
 * Usage: npx tsx scripts/backfill-daily.ts
 */

import "dotenv/config";
import { PrismaClient } from "../src/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { marketData } from "../src/lib/providers";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

async function backfill() {
  const symbols = await db.symbol.findMany({ where: { isActive: true } });
  const to = new Date().toISOString().slice(0, 10);
  const from = new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);

  console.log(`Backfilling ${symbols.length} symbols from ${from} to ${to}`);

  for (const sym of symbols) {
    try {
      const bars = await marketData.getDailyBars(sym.ticker, from, to);
      let created = 0;

      for (const bar of bars) {
        try {
          await db.dailyBar.upsert({
            where: {
              symbolId_date: { symbolId: sym.id, date: new Date(bar.date) },
            },
            update: {
              open: bar.open,
              high: bar.high,
              low: bar.low,
              close: bar.close,
              volume: bar.volume,
            },
            create: {
              symbolId: sym.id,
              date: new Date(bar.date),
              open: bar.open,
              high: bar.high,
              low: bar.low,
              close: bar.close,
              volume: bar.volume,
            },
          });
          created++;
        } catch {
          // Skip duplicates silently
        }
      }

      console.log(`  ${sym.ticker}: ${created} bars upserted`);

      // Rate limit: wait 1.2 seconds between symbols (Finnhub: 60/min)
      await new Promise((r) => setTimeout(r, 1200));
    } catch (err) {
      console.error(`  [FAIL] ${sym.ticker}:`, err instanceof Error ? err.message : err);
    }
  }

  console.log("Backfill complete.");
}

backfill()
  .catch((err) => {
    console.error("Fatal error:", err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
