import "dotenv/config";
import { createHash } from "node:crypto";
import { db } from "../src/lib/db";

const DEMO_SYMBOL = "DEMO";
const DEMO_CIK = "9999999999";

function date(value: string): Date {
  return new Date(`${value}T00:00:00.000Z`);
}

function key(...parts: string[]): string {
  return createHash("sha256").update(parts.join("|")).digest("hex");
}

const periods = [
  {
    accessionNumber: "DEMO-2025-Q4",
    form: "10-Q",
    filedAt: "2026-01-28",
    reportDate: "2025-12-31",
    startDate: "2025-10-01",
    endDate: "2025-12-31",
    fiscalYear: 2025,
    fiscalPeriod: "Q4",
    values: {
      revenue: 24_000_000_000,
      net_income: 3_400_000_000,
      operating_cash_flow: 4_100_000_000,
      capex: 1_050_000_000,
    },
  },
  {
    accessionNumber: "DEMO-2026-Q1",
    form: "10-Q",
    filedAt: "2026-04-29",
    reportDate: "2026-03-31",
    startDate: "2026-01-01",
    endDate: "2026-03-31",
    fiscalYear: 2026,
    fiscalPeriod: "Q1",
    values: {
      revenue: 25_600_000_000,
      net_income: 3_150_000_000,
      operating_cash_flow: 4_550_000_000,
      capex: 1_240_000_000,
    },
  },
  {
    accessionNumber: "DEMO-2026-Q2",
    form: "10-Q",
    filedAt: "2026-07-29",
    reportDate: "2026-06-30",
    startDate: "2026-04-01",
    endDate: "2026-06-30",
    fiscalYear: 2026,
    fiscalPeriod: "Q2",
    values: {
      revenue: 28_900_000_000,
      net_income: 3_780_000_000,
      operating_cash_flow: 5_020_000_000,
      capex: 1_480_000_000,
    },
  },
] as const;

const metricDefinitions = [
  { metric: "revenue", concept: "DemoRevenue" },
  { metric: "net_income", concept: "DemoNetIncome" },
  { metric: "operating_cash_flow", concept: "DemoOperatingCashFlow" },
  { metric: "capex", concept: "DemoCapitalExpenditure" },
] as const;

async function main() {
  if (!process.env.DATABASE_URL?.trim()) {
    throw new Error("DATABASE_URL is required to seed StockPulse demo evidence");
  }

  const symbol = await db.symbol.upsert({
    where: { ticker: DEMO_SYMBOL },
    update: {
      name: "StockPulse Demo Corp.",
      exchange: "DEMO",
      type: "Synthetic Demo Company",
      cik: DEMO_CIK,
    },
    create: {
      ticker: DEMO_SYMBOL,
      name: "StockPulse Demo Corp.",
      exchange: "DEMO",
      type: "Synthetic Demo Company",
      cik: DEMO_CIK,
    },
  });

  const filingRows = periods.map((period) => ({
    symbolId: symbol.id,
    cik: DEMO_CIK,
    accessionNumber: period.accessionNumber,
    form: period.form,
    filedAt: date(period.filedAt),
    reportDate: date(period.reportDate),
    acceptedAt: new Date(`${period.filedAt}T20:00:00.000Z`),
    primaryDocument: "stockpulse-demo-fixture.html",
    sourceUrl: `https://example.com/stockpulse-demo/evidence/${period.accessionNumber.toLowerCase()}`,
  }));

  const metricRows = periods.flatMap((period) =>
    metricDefinitions.map((definition) => ({
      metricKey: key(DEMO_SYMBOL, period.accessionNumber, definition.metric),
      symbolId: symbol.id,
      metric: definition.metric,
      value: period.values[definition.metric],
      unit: "USD",
      startDate: date(period.startDate),
      endDate: date(period.endDate),
      filedAt: date(period.filedAt),
      accessionNumber: period.accessionNumber,
      form: period.form,
      taxonomy: "demo-gaap",
      concept: definition.concept,
      frame: `DEMO-${period.fiscalPeriod}-${period.fiscalYear}`,
      fiscalYear: period.fiscalYear,
      fiscalPeriod: period.fiscalPeriod,
    })),
  );

  const factRows = metricRows.map((metric) => ({
    factKey: key("fact", metric.metricKey),
    symbolId: metric.symbolId,
    cik: DEMO_CIK,
    taxonomy: metric.taxonomy,
    concept: metric.concept,
    label: `Synthetic ${metric.metric.replaceAll("_", " ")}`,
    description: "Deterministic StockPulse demo fixture. This is not an SEC-reported fact.",
    unit: metric.unit,
    value: metric.value,
    startDate: metric.startDate,
    endDate: metric.endDate,
    filedAt: metric.filedAt,
    accessionNumber: metric.accessionNumber,
    form: metric.form,
    frame: metric.frame,
    fiscalYear: metric.fiscalYear,
    fiscalPeriod: metric.fiscalPeriod,
  }));

  const [filings, metrics, facts] = await Promise.all([
    db.secFiling.createMany({ data: filingRows, skipDuplicates: true }),
    db.secMetric.createMany({ data: metricRows, skipDuplicates: true }),
    db.secFact.createMany({ data: factRows, skipDuplicates: true }),
  ]);

  await db.jobRun.create({
    data: {
      jobName: "demo-evidence-seed",
      status: "success",
      endedAt: new Date(),
      metadata: {
        synthetic: true,
        symbol: DEMO_SYMBOL,
        filingsInserted: filings.count,
        metricsInserted: metrics.count,
        factsInserted: facts.count,
      },
    },
  });

  console.log(JSON.stringify({
    synthetic: true,
    symbol: DEMO_SYMBOL,
    companyName: "StockPulse Demo Corp.",
    filingsInserted: filings.count,
    metricsInserted: metrics.count,
    factsInserted: facts.count,
    reviewerPath: "/stocks/DEMO",
  }, null, 2));
}

main()
  .catch((error) => {
    console.error("Demo seed failed:", error instanceof Error ? error.message : error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await db.$disconnect();
  });
