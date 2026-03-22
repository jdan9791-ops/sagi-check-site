import { Redis } from "@upstash/redis";
import {
  RATE_LIMIT_PER_MINUTE,
  RATE_LIMIT_PER_DAY,
  CAPTCHA_THRESHOLD,
  BLOCK_THRESHOLD,
} from "./constants";

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

function todayKey(prefix: string, id: string): string {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD
  return `${prefix}:${id}:${today}`;
}

function minuteKey(prefix: string, id: string): string {
  const minute = new Date().toISOString().slice(0, 16); // YYYY-MM-DDTHH:mm
  return `${prefix}:min:${id}:${minute}`;
}

export interface RateLimitResult {
  allowed: boolean;
  requiresCaptcha: boolean;
  totalCount: number;
  reason?: string;
}

/**
 * Check rate limits for IP and fingerprint.
 * Layer 1: IP-based (10/min, 100/day)
 * Layer 2: Fingerprint-based (100/day)
 * Layer 3: CAPTCHA threshold check
 */
export async function checkRateLimit(
  ip: string,
  fingerprintId?: string
): Promise<RateLimitResult> {
  try {
    const pipeline = redis.pipeline();

    const ipDayKey = todayKey("ip", ip);
    const ipMinKey = minuteKey("ip", ip);

    pipeline.incr(ipDayKey);
    pipeline.expire(ipDayKey, 60 * 60 * 25); // 25h TTL
    pipeline.incr(ipMinKey);
    // NOTE: Do NOT call expire here — TTL is set only on first request (count=1)
    // to avoid blocked requests extending the window indefinitely.

    let fpDayCount = 0;
    if (fingerprintId) {
      const fpDayKey = todayKey("fp", fingerprintId);
      pipeline.incr(fpDayKey);
      pipeline.expire(fpDayKey, 60 * 60 * 25);
    }

    const results = await pipeline.exec();
    const ipDayCount = (results[0] as number) ?? 0;
    const ipMinCount = (results[2] as number) ?? 0;
    if (fingerprintId) {
      fpDayCount = (results[3] as number) ?? 0;
    }

    // Set 70s TTL only on the first request in the window so blocked retries
    // don't reset the expiry (which would permanently lock the user out).
    if (ipMinCount === 1) {
      void redis.expire(ipMinKey, 70);
    }

    // Check minute limit
    if (ipMinCount > RATE_LIMIT_PER_MINUTE) {
      return {
        allowed: false,
        requiresCaptcha: false,
        totalCount: ipDayCount,
        reason: "분당 요청 한도를 초과했습니다. 잠시 후 다시 시도해 주세요.",
      };
    }

    // Check daily IP limit
    if (ipDayCount > RATE_LIMIT_PER_DAY) {
      return {
        allowed: false,
        requiresCaptcha: false,
        totalCount: ipDayCount,
        reason: "오늘 이용 한도를 초과했습니다. 내일 다시 이용해 주세요.",
      };
    }

    // Check daily fingerprint limit
    if (fingerprintId && fpDayCount > RATE_LIMIT_PER_DAY) {
      return {
        allowed: false,
        requiresCaptcha: false,
        totalCount: fpDayCount,
        reason: "오늘 이용 한도를 초과했습니다. 내일 다시 이용해 주세요.",
      };
    }

    // Use the higher of IP/FP count for CAPTCHA threshold
    const totalCount = Math.max(ipDayCount, fpDayCount);

    if (totalCount > BLOCK_THRESHOLD) {
      return {
        allowed: false,
        requiresCaptcha: false,
        totalCount,
        reason: "비정상적인 사용이 감지되어 당일 이용이 제한되었습니다.",
      };
    }

    return {
      allowed: true,
      requiresCaptcha: totalCount >= CAPTCHA_THRESHOLD,
      totalCount,
    };
  } catch {
    // If Redis is unavailable, allow the request (fail open)
    return { allowed: true, requiresCaptcha: false, totalCount: 0 };
  }
}

/** Get the current minute request count for an IP. */
export async function getIpMinuteCount(ip: string): Promise<number> {
  try {
    const key = minuteKey("ip", ip);
    const count = await redis.get<number>(key);
    return count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Returns true (and sets cooldown) if an abuse alert should be sent for this IP.
 * Cooldown: 5 minutes per IP to prevent alert spam.
 */
export async function shouldSendAbuseAlert(ip: string): Promise<boolean> {
  const cooldownKey = `abuse-alert-cooldown:${ip}`;
  try {
    // SET NX = only set if key doesn't exist (atomic check-and-set)
    const set = await redis.set(cooldownKey, 1, { nx: true, ex: 300 }); // 5분 쿨다운
    return set === "OK";
  } catch {
    return false;
  }
}
