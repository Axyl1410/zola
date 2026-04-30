import { Redis } from "@upstash/redis/cloudflare";
import { env } from "@/utils/cf-util";

const redis = new Redis({
  url: env.UPSTASH_REDIS_REST_URL,
  token: env.UPSTASH_REDIS_REST_TOKEN,
});

export default redis;
