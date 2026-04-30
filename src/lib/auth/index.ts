import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { betterAuth } from "better-auth/minimal";
import {
  bearer,
  haveIBeenPwned,
  openAPI,
  testUtils,
} from "better-auth/plugins";
import { db } from "@/db/client";
import { env } from "@/utils/cf-util";
import { hashPassword, verifyPassword } from "./password-hash";
import { redisSecondaryStorage } from "./redis-secondary-storage";

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

  advanced: {
    ipAddress: {
      ipAddressHeaders: ["cf-connecting-ip"], // Cloudflare specific header
    },
  },

  rateLimit: {
    enabled: true,
    storage: "secondary-storage",
  },

  session: {
    storeSessionInDatabase: true, // Required when using oauth-provider with secondaryStorage
  },

  verification: {
    storeInDatabase: true,
  },

  secondaryStorage: redisSecondaryStorage,

  plugins: [
    bearer(),
    haveIBeenPwned(),
    openAPI(),
    ...(env.ENVIRONMENT === "development" ? [testUtils()] : []),
  ],
});
