import { createMiddleware } from "hono/factory";
import type { RateLimitOptions } from "@/lib/ratelimit";
import { checkRateLimit } from "@/lib/ratelimit";

const getClientIp = (headers: Headers): string | null => {
  const cfConnectingIp = headers.get("cf-connecting-ip")?.trim();
  if (cfConnectingIp) {
    return cfConnectingIp;
  }

  const xRealIp = headers.get("x-real-ip")?.trim();
  if (xRealIp) {
    return xRealIp;
  }

  const xForwardedFor = headers.get("x-forwarded-for");
  if (xForwardedFor) {
    const firstIp = xForwardedFor
      .split(",")
      .map((ip) => ip.trim())
      .find((ip) => ip.length > 0);

    if (firstIp) {
      return firstIp;
    }
  }

  return null;
};

export const rateLimitMiddleware = (options?: RateLimitOptions) =>
  createMiddleware(async (c, next) => {
    const user = c.get("user");
    const ip = getClientIp(c.req.raw.headers);
    let identifier = "global";
    if (user?.id) {
      identifier = `user:${user.id}`;
    } else if (ip) {
      identifier = `ip:${ip}`;
    }

    try {
      const { success, limit, remaining, reset } = await checkRateLimit(
        identifier,
        options
      );

      c.header("X-RateLimit-Limit", limit.toString());
      c.header("X-RateLimit-Remaining", remaining.toString());
      c.header("X-RateLimit-Reset", reset.toString());

      if (!success) {
        return c.json(
          {
            message: "Too many requests",
          },
          429
        );
      }
    } catch (error) {
      console.error("Upstash Redis fallback triggered:", error);
    }

    await next();
  });
