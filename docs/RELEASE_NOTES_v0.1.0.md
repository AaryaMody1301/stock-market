# StockPulse v0.1.0

StockPulse v0.1.0 is the first evidence-first release candidate series for the completed StockPulse research workflow.

## Highlights

- Next.js 16 / React 19 application with PostgreSQL + Prisma persistence.
- Canonical database-first live market-data reads with provider fallback and explicit stale/partial-data behavior.
- Credential-free reviewer demo with deterministic synthetic quotes, charts, search, profiles, news, and idempotently seeded evidence for the fictional `DEMO` company.
- Demo mode bypasses stored market rows and blocks Finnhub/Twelve Data request paths even when credentials are present; the UI and readiness response explicitly label synthetic data.
- SEC EDGAR submissions/companyfacts ingestion with identified fair-access requests, bounded retries, deterministic normalization, provenance, and idempotent persistence in live mode.
- Deterministic financial change intelligence that preserves reporting-context compatibility instead of comparing unlike periods.
- Browser-local thesis workspace with assumptions, risks, catalysts, invalidation criteria, evidence relationships, revision history, review checkpoints, and export/import.
- Watchlist research digest based on stable evidence-ID changes since the user's last review.
- Optional grounded AI analysis with strict citation-ID validation and explicit `Fact`, `Derived`, and `Inference` labels.
- Separate liveness and readiness probes, production migration checks, provider-boundary validation, and documented single-instance operational constraints.

## Reliability and security

The release gate runs against PostgreSQL 16 and requires:

- clean locked dependency installation;
- a high/critical production-runtime dependency gate that distinguishes runtime packages from dev/devOptional tooling in the committed lockfile;
- Prisma migration deployment;
- release metadata consistency;
- TypeScript checks for application and standalone scripts;
- ESLint;
- automated tests, including a no-network demo regression;
- production Next.js build;
- two consecutive demo-seed executions to prove idempotency;
- production-server smoke validation of health, readiness, synthetic quotes, the demo disclosure, and the primary reviewer routes while live provider/SEC/AI credentials are blanked.

Tagged releases rerun the same production demo smoke before publishing and also attach a CycloneDX SBOM for production dependencies.

## Demo-data boundary

`STOCKPULSE_DEMO_MODE=true` is intended for reviewers, development, and reproducible demonstrations. Demo market values and news are synthetic fixtures, not live or historical provider data. Seeded filing-like evidence uses `DEMO-*` accession identifiers and `example.com` source URLs and must not be presented as genuine SEC filings.

The full evidence/change/grounding/thesis workflow remains usable without market-provider credentials, SEC requests, or AI credentials. PostgreSQL is still used for the seeded evidence path.

## Live data and AI boundaries

StockPulse is a research tool, not a BUY/HOLD/SELL engine and not personalized investment advice.

Market-data provider credentials and public display/redistribution rights remain deployment/operator responsibilities. The source repository cannot grant exchange or provider rights. Live SEC evidence remains usable without optional AI, and browser-local thesis content is sent to an AI endpoint only after an explicit user action.

## Release acceptance

See `docs/RELEASE.md` for the full clean-environment gate and `docs/DEMO.md` for the credential-free reviewer path. A green source workflow proves the repository-level build/migration/test/demo-smoke gate; it does not by itself prove production credentials, provider entitlements, PostgreSQL backup/restore, reverse-proxy/TLS behavior, browser-local interaction correctness, or optional AI credentials.
