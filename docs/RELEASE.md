# StockPulse Release Gate

This document is the release gate for the first public StockPulse release series. It deliberately separates checks that GitHub Actions can prove from checks that require real credentials, contracts, infrastructure, or an owner decision.

## Release version

The current application version is read from `package.json`. Release tags must be either:

- `v<version>-rc.N` for release candidates, for example `v0.1.0-rc.1`;
- `v<version>` for the stable release, for example `v0.1.0`.

`npm run release:check` verifies that `package.json`, the root `package-lock.json` metadata, and the versioned release-notes file agree. Tag-triggered release CI additionally rejects tags that do not point to a commit already contained in `main`.

## Automated source gate

Every pull request to `main` must pass the normal CI workflow. A release tag reruns the same release-critical checks on the exact tagged commit:

1. `npm ci` from the committed lockfile;
2. production dependency audit at high severity or above;
3. PostgreSQL 16 startup;
4. `prisma migrate deploy` against a clean database;
5. release metadata validation;
6. application and script TypeScript checks;
7. ESLint;
8. unit/integration tests;
9. the production Next.js build;
10. two consecutive credential-free demo seeds, proving the synthetic evidence fixture is idempotent;
11. a production-server demo smoke using `npm run smoke:demo` with live market/SEC/AI credentials blanked;
12. a production-dependency CycloneDX SBOM attached to the GitHub release.

The production demo smoke starts the built `server.js` entry point and verifies:

- `/api/health` reports the StockPulse process healthy;
- `/api/ready` reports PostgreSQL reachable and `demo` as the only market provider;
- synthetic `DEMO` and `AAPL` quotes are returned without live provider credentials;
- the homepage renders the persistent synthetic-data disclosure;
- `/stocks/DEMO`, `/stocks/DEMO/changes`, `/stocks/DEMO/grounding`, and `/news` render successfully from the seeded reviewer dataset.

A tag must not publish a release if any source gate fails.

## Release-candidate environment gate

Before promoting an RC to the stable tag, validate the exact RC commit in a staging or production-like environment.

### Database and process

- Apply migrations with `npx prisma migrate deploy --schema=prisma/schema.prisma`.
- Verify PostgreSQL networking, permissions, restart behavior, and backup/restore using non-disposable data.
- Verify `npm start` through the actual reverse proxy/process supervisor.
- Verify `/api/health` and `/api/ready` through TLS and the real proxy path.
- Restart the web process and quote worker and confirm they recover without corrupting state.

Prisma documents `migrate deploy` as the production/staging command and recommends running it through deployment automation rather than temporarily pointing a local shell at the production database.

### Market-data providers

- Test the configured Finnhub and/or Twelve Data credentials against the exact endpoints StockPulse uses.
- Verify rate limits for the active plan.
- Record the provider plan privately; never commit API keys or contractual material.
- Verify display, redistribution, exchange-permission, and attribution rights before enabling provider-backed public market-data pages.

As of August 2026, Twelve Data states that individual plans are for personal/internal use and do not permit commercial third-party display or redistribution. Business/display/redistribution use can require a business plan, exchange approval, add-ons, attribution, or a separate redistribution agreement. Treat current provider terms as an operator gate because they can change independently of this repository.

### SEC EDGAR

- Configure a monitored `SEC_USER_AGENT` identifying the application/operator.
- Run at least one real ingestion against the target database.
- Confirm filing, fact, normalized metric, and deterministic-change evidence renders with source provenance.
- Re-run the same ingestion and verify unique evidence remains idempotent.

The SEC currently limits automated access to 10 requests per second in total and asks automated clients to declare a descriptive User-Agent. StockPulse's serialized SEC client remains below that ceiling in one process; do not horizontally scale ingestion without coordinated throttling.

### Browser research workflow

Using a clean browser profile:

1. open a stock page with stored SEC evidence;
2. inspect deterministic changes;
3. create a thesis with assumptions, risks, catalysts, and an invalidation criterion;
4. import one SEC evidence item and classify its relationship;
5. mark the current evidence set reviewed;
6. create and restore a thesis revision;
7. add the symbol to the watchlist and verify the research-change digest;
8. export and re-import the thesis data;
9. verify malformed imports/storage remain rejected.

The automated production smoke deliberately does not replace this browser-state acceptance check. IndexedDB/localStorage interaction remains a distinct release-candidate validation surface until browser automation is added.

### Optional grounded AI

If AI is enabled in the intended deployment:

- verify the configured key, model, and HTTPS endpoint;
- generate one grounded analysis and confirm all displayed evidence IDs exist in the grounding packet;
- run one explicit `Challenge my thesis` request;
- confirm provider failure leaves deterministic evidence usable;
- confirm no model call occurs merely by opening or editing browser-local research.

AI is optional and is not a release blocker when the public deployment intentionally runs without it.

## Stable promotion

Promote to the stable tag only when:

- the release-candidate source workflow is green;
- the environment gate above has been completed for the intended deployment shape;
- public data-display rights are resolved for every enabled provider-backed surface;
- release notes accurately describe the shipped scope and limitations;
- any owner-level repository/legal choices intended for the release are complete.

Recommended sequence:

1. merge the release PR to `main`;
2. confirm normal `main` CI, including the production demo smoke, is green;
3. tag `v0.1.0-rc.1` on that reviewed `main` commit;
4. let `.github/workflows/release.yml` publish the prerelease and SBOM;
5. execute the environment gate against the RC;
6. fix release-only defects through normal PRs and issue another RC if necessary;
7. tag `v0.1.0` only after acceptance passes.

## Explicit boundaries

A green GitHub release workflow proves repository-level build/test/migration/audit/demo-smoke checks for the tagged commit. It does not prove provider contracts, production secrets, live database backups, TLS/proxy correctness, exchange entitlements, browser-local interaction correctness, or investment suitability.
