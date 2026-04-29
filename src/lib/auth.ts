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
    revokeSessionsOnPasswordReset: true,
    password: {
      hash: hashPassword,
      verify: verifyPassword,
    },
  },

  account: {
    accountLinking: {
      trustedProviders: ["google"],
    },
  },

  socialProviders: {
    google: {
      clientId: [env.GOOGLE_CLIENT_ID, env.GOOGLE_ANDROID_CLIENT_ID],
      clientSecret: env.GOOGLE_CLIENT_SECRET,
    },
  },

  plugins: [bearer(), haveIBeenPwned(), openAPI()],
});
