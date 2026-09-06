# StockPulse v0.1.0

StockPulse v0.1.0 is the first evidence-first release candidate series for the completed StockPulse research workflow.

## Highlights

- Next.js 16 / React 19 application with PostgreSQL + Prisma persistence.
- Canonical database-first market-data reads with provider fallback and explicit stale/partial-data behavior.
- SEC EDGAR submissions/companyfacts ingestion with identified fair-access requests, bounded retries, deterministic normalization, provenance, and idempotent persistence.
- Deterministic financial change intelligence that preserves reporting-context compatibility instead of comparing unlike periods.
- Browser-local thesis workspace with assumptions, risks, catalysts, invalidation criteria, evidence relationships, revision history, review checkpoints, and export/import.
- Watchlist research digest based on stable evidence-ID changes since the user's last review.
- Optional grounded AI analysis with strict citation-ID validation and explicit `Fact`, `Derived`, and `Inference` labels.
- Separate liveness and readiness probes, production migration checks, provider-boundary validation, and documented single-instance operational constraints.

## Reliability and security

The release gate runs against PostgreSQL 16 and requires:

- clean locked dependency installation;
- high-severity production dependency audit;
- Prisma migration deployment;
- release metadata consistency;
- TypeScript checks for application and standalone scripts;
- ESLint;
- automated tests;
- production Next.js build.

Tagged releases also publish a CycloneDX SBOM for production dependencies.

## Data and AI boundaries

StockPulse is a research tool, not a BUY/HOLD/SELL engine and not personalized investment advice.

Market-data provider credentials and public display/redistribution rights remain deployment/operator responsibilities. The source repository cannot grant exchange or provider rights. SEC evidence remains usable without optional AI, and browser-local thesis content is sent to an AI endpoint only after an explicit user action.

## Release acceptance

See `docs/RELEASE.md` for the full clean-environment gate. A green source workflow does not by itself prove production credentials, provider entitlements, PostgreSQL backup/restore, reverse-proxy/TLS behavior, or optional AI credentials.
