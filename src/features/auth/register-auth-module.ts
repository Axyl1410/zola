import { auth } from "@/lib/auth";
import type { AppInstance } from "@/types";

export function registerAuthModule(app: AppInstance) {
  app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));
}
