type EnvLike = Record<string, string | undefined>;

const TRUE_VALUES = new Set(["1", "true", "yes", "on"]);

export function isDemoMode(env: EnvLike = process.env): boolean {
  const value = env.STOCKPULSE_DEMO_MODE?.trim().toLowerCase();
  return value ? TRUE_VALUES.has(value) : false;
}

export function assertLiveMarketDataAllowed(env: EnvLike = process.env): void {
  if (isDemoMode(env)) {
    throw new Error(
      "Live market-data access is disabled while STOCKPULSE_DEMO_MODE is enabled",
    );
  }
}
