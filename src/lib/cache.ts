/**
 * Simple in-memory cache with TTL and request deduplication.
 * Prevents thundering-herd when multiple Suspense components
 * request the same data simultaneously.
 */

interface CacheEntry<T> {
  data: T;
  expiresAt: number;
}

const MAX_CACHE_SIZE = 500;
const store = new Map<string, CacheEntry<unknown>>();
const inflight = new Map<string, Promise<unknown>>();

export function cacheGet<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.data as T;
}

export function cacheSet<T>(key: string, data: T, ttlSeconds: number): void {
  // Evict oldest entries when cache reaches max size
  if (store.size >= MAX_CACHE_SIZE) {
    const firstKey = store.keys().next().value;
    if (firstKey !== undefined) store.delete(firstKey);
  }
  store.set(key, {
    data,
    expiresAt: Date.now() + ttlSeconds * 1000,
  });
}

/**
 * Get cached data or run the fetcher exactly once — concurrent callers
 * with the same key share a single in-flight promise.
 */
export function cacheGetOrFetch<T>(
  key: string,
  ttlSeconds: number,
  fetcher: () => Promise<T>,
): Promise<T> {
  const cached = cacheGet<T>(key);
  if (cached) return Promise.resolve(cached);

  const existing = inflight.get(key);
  if (existing) return existing as Promise<T>;

  const promise = fetcher()
    .then((data) => {
      cacheSet(key, data, ttlSeconds);
      inflight.delete(key);
      return data;
    })
    .catch((err) => {
      inflight.delete(key);
      throw err;
    });

  inflight.set(key, promise);
  return promise;
}

export function cacheDelete(key: string): void {
  store.delete(key);
}

export function cacheClear(): void {
  store.clear();
  inflight.clear();
}
