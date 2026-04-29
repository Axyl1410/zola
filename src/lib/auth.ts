import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, haveIBeenPwned, openAPI } from "better-auth/plugins";
import { db } from "../db/client";
import { env } from "../utils/cf-util";
import { hashPassword, verifyPassword } from "./password-hash";

export const auth = betterAuth({
  experimental: { joins: true },
  baseURL: env.BETTER_AUTH_URL,
  database: drizzleAdapter(db.getDatabase(), {
    provider: "sqlite",
  }),

  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },

  plugins: [bearer(), haveIBeenPwned(), openAPI()],
});
