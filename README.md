# StockPulse: API Setup and Run Guide

This guide explains exactly how to:

1. Get all required API keys.
2. Configure environment variables.
3. Set up PostgreSQL + Prisma.
4. Run the website locally.
5. Run background data workers.
6. Deploy with PM2 + Nginx (Hostinger VPS flow).

## 1. Prerequisites

Install the following first:

1. Node.js 20+ (LTS recommended)
2. npm 10+
3. PostgreSQL 14+ (local or remote)
4. Git

Verify:

```powershell
node -v
npm -v
```

## 2. Clone and Install

```powershell
git clone <your-repo-url>
cd stock-market
npm install
```

## 3. Get API Keys

This project supports:

1. `FINNHUB_API_KEY` (primary provider)
2. `TWELVEDATA_API_KEY` (fallback provider)

### 3.1 Finnhub (required)

1. Go to `https://finnhub.io/`
2. Click `Get free API key` and create an account
3. Verify your email
4. Open dashboard and copy API key
5. Paste into `FINNHUB_API_KEY`

Notes:

1. Free tier limits can change; check your dashboard for current quota.
2. This app uses Finnhub for quotes, symbol search, profiles, bars, and news.

### 3.2 Twelve Data (recommended fallback)

1. Go to `https://twelvedata.com/`
2. Create a free account
3. Open API dashboard
4. Copy your API key
5. Paste into `TWELVEDATA_API_KEY`

Notes:

1. Used as backup when Finnhub fails for quotes/search/bars.
2. Company profile and news fallback are limited on free tier.

## 4. Environment Configuration

This repo includes `.env.example`. Copy it to both `.env.local` and `.env`:

```powershell
Copy-Item .env.example .env.local
Copy-Item .env.example .env
```

Why both files:

1. Next.js app reads `.env.local`
2. Worker scripts (`tsx` + `dotenv/config`) read `.env`

Set values in both files:

```env
DATABASE_URL="postgresql://user:password@localhost:5432/stockmarket?schema=public"
FINNHUB_API_KEY="your_finnhub_key"
TWELVEDATA_API_KEY="your_twelvedata_key"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
POLL_INTERVAL_MS="15000"
POLL_SYMBOLS="AAPL,MSFT,GOOGL,AMZN,TSLA,META,NVDA,JPM,V,JNJ"
```

## 5. PostgreSQL Setup

Create database:

```sql
CREATE DATABASE stockmarket;
```

Update `DATABASE_URL` with your real user/password/host/port.

Example local URL:

```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/stockmarket?schema=public"
```

## 6. Prisma Setup

Run migrations and generate client:

```powershell
npx prisma migrate dev --name init
npx prisma generate
```

Optional check:

```powershell
npx prisma studio
```

## 7. Run the Website (Local)

Start Next.js app:

```powershell
npm run dev
```

Open:

1. `http://localhost:3000`

Build test:

```powershell
npm run build
npm run start
```

## 8. Run Data Workers

### 8.1 Quote poller (continuous snapshots)

```powershell
npx tsx scripts/poll-quotes.ts
```

What it does:

1. Ensures symbols exist in DB
2. Polls latest quote data
3. Writes to `quote_snapshots`
4. Logs each job in `job_runs`

### 8.2 Historical daily backfill

```powershell
npx tsx scripts/backfill-daily.ts
```

What it does:

1. Pulls ~1 year OHLCV per active symbol
2. Upserts into `daily_bars`

## 9. Quick API Health Checks

With app running:

```powershell
curl "http://localhost:3000/api/quotes?symbols=AAPL,MSFT"
curl "http://localhost:3000/api/stocks/search?q=apple"
curl "http://localhost:3000/api/news?category=general"
```

Expected:

1. HTTP 200 with JSON `data` arrays
2. No `Failed to fetch` errors

## 10. Production (Hostinger VPS Pattern)

This repo already includes:

1. `ecosystem.config.js` (PM2 apps)
2. `deploy/nginx.conf` (reverse proxy + SSL)

Typical production steps:

1. Install Node.js, npm, PostgreSQL, Nginx, PM2 on VPS
2. Clone repo to `/var/www/stockpulse`
3. Run `npm install`
4. Create `.env` (production values)
5. Run `npx prisma migrate deploy`
6. Run `npm run build`
7. Start PM2: `pm2 start ecosystem.config.js`
8. Configure Nginx with `deploy/nginx.conf` and your real domain
9. Install SSL cert (certbot)
10. Reload services (`pm2 save`, `systemctl reload nginx`)

## 11. Troubleshooting

### Error: `FINNHUB_API_KEY is not set`

1. Confirm key exists in `.env.local` and `.env`
2. Restart dev server

### Error: Prisma connection failure

1. Recheck `DATABASE_URL`
2. Confirm Postgres is running
3. Confirm DB/user permissions

### Scripts run but website works

1. Usually means `.env` is missing (scripts use dotenv)
2. Copy `.env.local` to `.env` and retry

### Build fails in production

1. Run `npm run build` locally first
2. Ensure migration is deployed: `npx prisma migrate deploy`
3. Confirm environment variables are present in server shell/session

## 12. Security Notes

1. Never commit real `.env` or `.env.local`
2. Keep only `.env.example` in git
3. Rotate API keys if leaked
4. Use DB credentials with least privilege
