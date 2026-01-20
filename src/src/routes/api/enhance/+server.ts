import { json } from "@sveltejs/kit";
import type { RequestHandler } from "./$types";
import type { KVNamespace } from "@cloudflare/workers-types";
import { enhanceImage } from "$lib/gemini";

// Rate limit configuration
const RATE_LIMIT = {
    minIntervalMs: 60 * 1000, // 1 minute between calls
    maxDailyLimit: 5, // 5 calls per day
    dailyResetMs: 24 * 60 * 60 * 1000, // 24 hours
};

interface RateLimitEntry {
    lastCallTime: number;
    dailyCalls: number;
    dailyResetTime: number;
}

function getClientIP(request: Request): string {
    // Cloudflare provides the real IP in CF-Connecting-IP header
    const cfIP = request.headers.get("cf-connecting-ip");
    if (cfIP) return cfIP;

    const forwarded = request.headers.get("x-forwarded-for");
    if (forwarded) return forwarded.split(",")[0].trim();

    const realIP = request.headers.get("x-real-ip");
    if (realIP) return realIP;

    return "anonymous";
}

async function checkRateLimit(
    kv: KVNamespace | undefined,
    clientIP: string
): Promise<{ allowed: boolean; error?: string; retryAfter?: number }> {
    const now = Date.now();
    const key = `ratelimit:${clientIP}`;

    // Fallback for local dev without KV
    if (!kv) {
        console.warn("KV not available, rate limiting disabled");
        return { allowed: true };
    }

    let entry: RateLimitEntry | null = null;

    try {
        entry = await kv.get(key, "json");
    } catch {
        // Key doesn't exist yet
    }

    // Initialize entry if doesn't exist
    if (!entry) {
        entry = {
            lastCallTime: 0,
            dailyCalls: 0,
            dailyResetTime: now + RATE_LIMIT.dailyResetMs,
        };
    }

    // Reset daily counter if past reset time
    if (now >= entry.dailyResetTime) {
        entry.dailyCalls = 0;
        entry.dailyResetTime = now + RATE_LIMIT.dailyResetMs;
    }

    // Check daily limit
    if (entry.dailyCalls >= RATE_LIMIT.maxDailyLimit) {
        const hoursUntilReset = Math.ceil((entry.dailyResetTime - now) / (60 * 60 * 1000));
        return {
            allowed: false,
            error: `Daily limit reached (${RATE_LIMIT.maxDailyLimit} enhancements per day). Try again in ${hoursUntilReset} hour${hoursUntilReset > 1 ? "s" : ""}.`,
            retryAfter: Math.ceil((entry.dailyResetTime - now) / 1000),
        };
    }

    // Check per-minute limit
    const timeSinceLastCall = now - entry.lastCallTime;
    if (timeSinceLastCall < RATE_LIMIT.minIntervalMs) {
        const secondsRemaining = Math.ceil((RATE_LIMIT.minIntervalMs - timeSinceLastCall) / 1000);
        return {
            allowed: false,
            error: `Please wait ${secondsRemaining} second${secondsRemaining > 1 ? "s" : ""} before enhancing another photo.`,
            retryAfter: secondsRemaining,
        };
    }

    return { allowed: true };
}

async function recordCall(kv: KVNamespace | undefined, clientIP: string): Promise<void> {
    if (!kv) return;

    const key = `ratelimit:${clientIP}`;
    const now = Date.now();

    let entry: RateLimitEntry | null = null;

    try {
        entry = await kv.get(key, "json");
    } catch {
        // Key doesn't exist yet
    }

    if (!entry) {
        entry = {
            lastCallTime: now,
            dailyCalls: 1,
            dailyResetTime: now + RATE_LIMIT.dailyResetMs,
        };
    } else {
        // Reset if past daily reset time
        if (now >= entry.dailyResetTime) {
            entry.dailyCalls = 1;
            entry.dailyResetTime = now + RATE_LIMIT.dailyResetMs;
        } else {
            entry.dailyCalls++;
        }
        entry.lastCallTime = now;
    }

    // Store with 24-hour TTL for auto-cleanup
    await kv.put(key, JSON.stringify(entry), { expirationTtl: 86400 });
}

export const POST: RequestHandler = async ({ request, platform }) => {
    try {
        const kv = platform?.env?.RATE_LIMIT_KV;
        const apiKey = platform?.env?.GEMINI_API_KEY;

        // Check rate limit
        const clientIP = getClientIP(request);
        const rateCheck = await checkRateLimit(kv, clientIP);

        if (!rateCheck.allowed) {
            return json(
                { success: false, error: rateCheck.error },
                {
                    status: 429,
                    headers: rateCheck.retryAfter
                        ? { "Retry-After": String(rateCheck.retryAfter) }
                        : {}
                }
            );
        }

        const { imageBase64, mimeType } = await request.json();

        if (!imageBase64 || !mimeType) {
            return json(
                { success: false, error: "Missing image data" },
                { status: 400 }
            );
        }

        const result = await enhanceImage(imageBase64, mimeType, apiKey || "");

        if (!result.success) {
            return json(
                { success: false, error: result.error },
                { status: 500 }
            );
        }

        // Record successful call for rate limiting
        await recordCall(kv, clientIP);

        return json({
            success: true,
            imageBase64: result.imageBase64,
            mimeType: result.mimeType,
        });
    } catch (error) {
        console.error("Enhancement API error:", error);
        return json(
            {
                success: false,
                error: "Something went wrong. Please try again.",
            },
            { status: 500 }
        );
    }
};
