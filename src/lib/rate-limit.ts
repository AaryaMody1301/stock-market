import { NextResponse } from "next/server";

const hits = new Map<string, number[]>();

/**
 * Simple in-memory sliding-window rate limiter.
 * Returns null if allowed, or a 429 NextResponse if rate-limited.
 */
export function rateLimit(
  ip: string,
  { windowMs = 60_000, max = 60 } = {},
): NextResponse | null {
  const now = Date.now();
  const key = ip;
  const timestamps = hits.get(key) ?? [];

  // Remove entries outside the window
  const windowStart = now - windowMs;
  const recent = timestamps.filter((t) => t > windowStart);

  if (recent.length >= max) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429, headers: { "Retry-After": String(Math.ceil(windowMs / 1000)) } },
    );
  }

  recent.push(now);
  hits.set(key, recent);
  return null;
}
