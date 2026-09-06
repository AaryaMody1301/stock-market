# StockPulse Release Status

This document distinguishes **source-code completion** from **environment/operator validation**. The repository can be complete while a public live deployment still requires private credentials, contractual rights, infrastructure checks, and owner-level GitHub/legal decisions.

## Current release state

**Repository implementation: source-complete for the current StockPulse scope, including a credential-free reviewer mode.**

The `v0.1.0` release series is prepared for release-candidate tagging. Normal CI validates version/release metadata, and `.github/workflows/release.yml` reruns the release-critical source gate on an exact `v0.1.0-rc.N` or `v0.1.0` tag before publishing a GitHub release with a production-dependency CycloneDX SBOM. No stable release should be tagged until the environment/operator gate in `docs/RELEASE.md` is completed for the intended deployment.

The checked-in application, workers, data model, evidence pipeline, thesis workflow, deterministic change intelligence, optional grounded AI, client-side portfolio/watchlist behavior, deployment examples, readiness/liveness probes, tests, CI gates, release automation, and credential-free demo path are implemented.

### Foundation

- runtime validation at provider boundaries;
- centralized symbol normalization;
- bounded process-local rate limiting;
- non-overlapping/idempotent quote polling;
- CI type/lint/test/build gates;
- immutable SHA-pinned checkout/setup-node workflow actions;
- deterministic release metadata validation;
- runtime-aware high/critical dependency auditing that distinguishes required runtime packages from dev/devOptional tooling in the committed lockfile;
- truthful curated-market product wording;
- separate liveness and readiness endpoints;
- deployment, contribution, security, demo, and release documentation.

### Live canonical market data

- database-first canonical quote/profile/history reads with provider fallback;
- 45-second quote freshness and seven-day profile freshness;
- daily-history completeness tied to the latest **completed U.S. market session** rather than a broad calendar-day end tolerance;
- weekends, NYSE holidays, normal closes, and published early closes handled by a shared market calendar;
- Finnhub secrets transmitted by supported authentication header rather than request URL;
- bounded explicit Twelve Data history requests avoid truncating range data with `outputsize`;
- partial quote responses preserve watchlist visibility and do not turn missing portfolio prices into zero-value losses;
- comparison percentage series use a common actual trading-date baseline;
- selected chart ranges never silently fall back to a mislabeled longer range.

### Credential-free demo mode

- `STOCKPULSE_DEMO_MODE=true` selects deterministic local market fixtures instead of live providers;
- demo mode bypasses stored quote/profile/bar rows so a previously used database cannot leak live values into the demo;
- Finnhub and Twelve Data request paths fail closed while demo mode is enabled, even when credentials are present;
- quotes, daily bars, search, profiles, market news, and company news are deterministic synthetic fixtures;
- the application shell permanently labels the market data as synthetic while demo mode is active;
- `/api/ready` reports provider `demo`, mode `demo`, and `syntheticDemoData: true`;
- `npm run demo:seed` creates fictional `DEMO` evidence with `DEMO-*` accession IDs and `example.com` fixture links;
- the demo seed is idempotent and CI runs it twice;
- regression tests replace `fetch` with a throwing function and verify that demo market operations do not attempt network access.

Demo market/evidence fixtures are demonstration data, not real or historical market data and not genuine SEC filings.

### SEC evidence

- SEC ticker/CIK mapping;
- submissions + companyfacts ingestion;
- bounded retry/backoff and fair-access serialization;
- bounded continuation-history ingestion;
- additive SEC filing/fact/metric schema;
- deterministic metric normalization with provenance;
- idempotent inserts and accurate inserted-row job counts;
- stock evidence API/UI and degraded evidence-first stock page behavior.

Live SEC ingestion remains separate from the seeded demo path.

### Thesis workspace

- browser-local validated thesis storage;
- assumptions, risks, catalysts, invalidation criteria;
- supports/contradicts/qualifies/unresolved evidence relationships;
- revision history and restore-to-editor workflow;
- versioned import/export;
- explicit evidence review checkpoints;
- deterministic research-completeness/research-debt signal;
- direct import of stored evidence as unresolved thesis evidence.

### Change intelligence

- deterministic period-over-period metric changes;
- amended/duplicate reporting-context selection rules;
- instant facts compared by reporting date;
- duration facts compared only across compatible durations;
- quarter-only observations preferred over YTD observations sharing the latest end date;
- unit-safe comparisons;
- source provenance on each change;
- stable “since last review” evidence-ID differences;
- watchlist-level research-change digest for watched companies with saved theses.

### Grounded AI + release experience

- bounded versioned grounding packets;
- strict Fact/Derived/Inference output contract;
- summary and claim citation-ID validation;
- empty-grounding rejection;
- recommendation/positioning/price-target language rejection;
- optional OpenAI-compatible provider integration with timeout/rate limiting;
- explicit “challenge my thesis” upload action;
- deterministic fallback when AI is absent/fails;
- StockPulse branding/metadata cleanup;
- PostgreSQL migration + idempotency verification in CI;
- tag/branch/version checks before release publication;
- production-dependency SBOM generation for tagged releases.

### Runtime readiness

- `/api/health` is a lightweight process liveness probe;
- `/api/ready` verifies PostgreSQL connectivity and that the selected market-data mode is configured;
- live mode requires at least one configured live provider;
- demo mode counts the built-in deterministic provider as the configured market provider;
- readiness reports SEC/AI/app-URL configuration without returning secret values;
- reserved `.example` SEC contact identities are treated as placeholders rather than live-ingestion-ready configuration.

## Deliberately not implemented

These are product/operational choices rather than incomplete hidden dependencies:

- automatic BUY/HOLD/SELL scoring or price targets;
- silent AI upload of local thesis research;
- mandatory accounts/server sync for browser-local research;
- horizontal multi-process web scaling while cache/rate-limit state is process-local;
- unbounded SEC historical crawling from normal interactive ingestion;
- claims that a market-data subscription grants rights it may not grant.

## Owner/repository decisions still required

These cannot be selected truthfully by application code:

1. **Open-source license:** no `LICENSE` has been chosen. The repository remains unlicensed under default copyright rules until the owner selects one.
2. **Branch protection/ruleset:** CI should be required on `main`. If GitHub settings still leave `main` unprotected, an owner/admin must enable the rule because source files alone cannot enforce it.
3. **Repository metadata:** description/homepage/topics can be maintained in GitHub repository settings; they do not affect application correctness.

## Must still be validated for a live public deployment

The credential-free demo does **not** satisfy the live production gate. Repository CI cannot validate private production configuration. Before enabling live provider-backed public surfaces, an operator must confirm:

1. real Finnhub/Twelve Data credentials and plan-specific endpoints;
2. market-data display/redistribution rights and required attribution;
3. production PostgreSQL connectivity, permissions, backup/restore, and migration against a real staging copy;
4. real monitored `SEC_USER_AGENT` and identified live SEC ingestion;
5. Nginx/Hostinger/VPS proxy headers, TLS, process supervision, and restart behavior;
6. optional AI key/model behavior if that feature is enabled;
7. `/api/health` and `/api/ready` through the actual deployed reverse proxy;
8. browser-level interaction smoke tests in the deployed site.

Current provider licensing varies by plan, market, and use. Treat display, external-distribution, exchange-permission, and attribution rights as explicit operator gates and re-check the current provider contract immediately before launch.

Those checks depend on secrets, provider contracts, production infrastructure, or owner decisions and therefore cannot be truthfully marked complete by source-code CI alone.
