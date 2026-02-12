import { Redis } from "@upstash/redis";
import { Ratelimit } from "@upstash/ratelimit";
import crypto from "crypto";

// ─── Redis client (lazy init) ───
let redis: Redis | null = null;

function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    console.warn("[Redis] UPSTASH_REDIS_REST_URL or TOKEN not set — falling back to in-memory");
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}

// ─── Rate Limiter ───
let rateLimiter: Ratelimit | null = null;

function getRateLimiter(): Ratelimit | null {
  if (rateLimiter) return rateLimiter;

  const r = getRedis();
  if (!r) return null;

  rateLimiter = new Ratelimit({
    redis: r,
    limiter: Ratelimit.slidingWindow(5, "60 s"),
    prefix: "mq:ratelimit",
  });
  return rateLimiter;
}

// ─── In-memory fallback rate limiter ───
const memoryRateLimit = new Map<string, { start: number; count: number }>();
const RATE_LIMIT_WINDOW = 60_000;
const RATE_LIMIT_MAX = 5;

function checkMemoryRateLimit(key: string): boolean {
  const now = Date.now();
  const entry = memoryRateLimit.get(key);
  if (!entry || now - entry.start > RATE_LIMIT_WINDOW) {
    memoryRateLimit.set(key, { start: now, count: 1 });
    return true;
  }
  entry.count++;
  return entry.count <= RATE_LIMIT_MAX;
}

// Clean old entries periodically
if (typeof globalThis !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of memoryRateLimit) {
      if (now - entry.start > RATE_LIMIT_WINDOW) memoryRateLimit.delete(key);
    }
  }, 60_000);
}

/**
 * Check rate limit for a user. Uses Upstash Redis if available, falls back to in-memory.
 */
export async function checkRateLimit(userId: string): Promise<{ allowed: boolean }> {
  const limiter = getRateLimiter();

  if (limiter) {
    try {
      const { success } = await limiter.limit(userId);
      return { allowed: success };
    } catch (err) {
      console.error("[Redis] Rate limit error, falling back:", err);
    }
  }

  return { allowed: checkMemoryRateLimit(userId) };
}

// ─── Analysis Cache ───

const CACHE_PREFIX = "mq:cache:";
const CACHE_TTL = 7 * 24 * 60 * 60; // 7 days in seconds

/**
 * Generate a cache key from analysis input (content hash + domain).
 */
function getCacheKey(text: string, domain: string): string {
  const hash = crypto
    .createHash("sha256")
    .update(`${domain}:${text.trim().slice(0, 3000)}`)
    .digest("hex")
    .slice(0, 16);
  return `${CACHE_PREFIX}${domain}:${hash}`;
}

/**
 * Get a cached analysis result. Returns null if not found or Redis unavailable.
 */
export async function getCachedAnalysis(text: string, domain: string): Promise<Record<string, unknown> | null> {
  const r = getRedis();
  if (!r) return null;

  try {
    const key = getCacheKey(text, domain);
    const cached = await r.get<Record<string, unknown>>(key);
    return cached || null;
  } catch (err) {
    console.error("[Redis] Cache get error:", err);
    return null;
  }
}

/**
 * Store an analysis result in cache.
 */
export async function setCachedAnalysis(text: string, domain: string, result: Record<string, unknown>): Promise<void> {
  const r = getRedis();
  if (!r) return;

  try {
    const key = getCacheKey(text, domain);
    await r.set(key, result, { ex: CACHE_TTL });
  } catch (err) {
    console.error("[Redis] Cache set error:", err);
  }
}
