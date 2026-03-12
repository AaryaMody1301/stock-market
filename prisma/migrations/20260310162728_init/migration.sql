-- CreateTable
CREATE TABLE "symbols" (
    "id" SERIAL NOT NULL,
    "ticker" VARCHAR(10) NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "exchange" VARCHAR(20) NOT NULL,
    "type" VARCHAR(50) NOT NULL DEFAULT 'Common Stock',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "symbols_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "quote_snapshots" (
    "id" SERIAL NOT NULL,
    "symbolId" INTEGER NOT NULL,
    "price" DECIMAL(12,4) NOT NULL,
    "change" DECIMAL(12,4) NOT NULL,
    "changePct" DECIMAL(8,4) NOT NULL,
    "volume" BIGINT NOT NULL,
    "high" DECIMAL(12,4) NOT NULL,
    "low" DECIMAL(12,4) NOT NULL,
    "open" DECIMAL(12,4) NOT NULL,
    "prevClose" DECIMAL(12,4) NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "quote_snapshots_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_bars" (
    "id" SERIAL NOT NULL,
    "symbolId" INTEGER NOT NULL,
    "date" DATE NOT NULL,
    "open" DECIMAL(12,4) NOT NULL,
    "high" DECIMAL(12,4) NOT NULL,
    "low" DECIMAL(12,4) NOT NULL,
    "close" DECIMAL(12,4) NOT NULL,
    "volume" BIGINT NOT NULL,

    CONSTRAINT "daily_bars_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "company_profiles" (
    "id" SERIAL NOT NULL,
    "symbolId" INTEGER NOT NULL,
    "logo" VARCHAR(500),
    "industry" VARCHAR(200),
    "sector" VARCHAR(100),
    "marketCap" DECIMAL(20,2),
    "website" VARCHAR(500),
    "description" TEXT,
    "country" VARCHAR(5),
    "currency" VARCHAR(10),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "company_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "market_news" (
    "id" SERIAL NOT NULL,
    "headline" VARCHAR(500) NOT NULL,
    "summary" TEXT,
    "source" VARCHAR(100) NOT NULL,
    "url" VARCHAR(1000) NOT NULL,
    "imageUrl" VARCHAR(1000),
    "category" VARCHAR(50) NOT NULL,
    "publishedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "market_news_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_runs" (
    "id" SERIAL NOT NULL,
    "jobName" VARCHAR(100) NOT NULL,
    "status" VARCHAR(20) NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endedAt" TIMESTAMP(3),
    "error" TEXT,
    "metadata" JSONB,

    CONSTRAINT "job_runs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "symbols_ticker_key" ON "symbols"("ticker");

-- CreateIndex
CREATE INDEX "symbols_exchange_idx" ON "symbols"("exchange");

-- CreateIndex
CREATE INDEX "quote_snapshots_symbolId_timestamp_idx" ON "quote_snapshots"("symbolId", "timestamp");

-- CreateIndex
CREATE INDEX "quote_snapshots_timestamp_idx" ON "quote_snapshots"("timestamp");

-- CreateIndex
CREATE INDEX "daily_bars_date_idx" ON "daily_bars"("date");

-- CreateIndex
CREATE UNIQUE INDEX "daily_bars_symbolId_date_key" ON "daily_bars"("symbolId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "company_profiles_symbolId_key" ON "company_profiles"("symbolId");

-- CreateIndex
CREATE INDEX "market_news_publishedAt_idx" ON "market_news"("publishedAt");

-- CreateIndex
CREATE INDEX "market_news_category_idx" ON "market_news"("category");

-- CreateIndex
CREATE INDEX "job_runs_jobName_startedAt_idx" ON "job_runs"("jobName", "startedAt");

-- AddForeignKey
ALTER TABLE "quote_snapshots" ADD CONSTRAINT "quote_snapshots_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "daily_bars" ADD CONSTRAINT "daily_bars_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "company_profiles" ADD CONSTRAINT "company_profiles_symbolId_fkey" FOREIGN KEY ("symbolId") REFERENCES "symbols"("id") ON DELETE CASCADE ON UPDATE CASCADE;
