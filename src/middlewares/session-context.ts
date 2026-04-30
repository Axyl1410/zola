import type { MiddlewareHandler } from "hono";
import { auth } from "@/lib/auth";
import type { AppVariables } from "@/types";

export const sessionContextMiddleware: MiddlewareHandler<{
  Bindings: Env;
  Variables: AppVariables;
}> = async (c, next) => {
  const sessionData = await auth.api.getSession({
    headers: c.req.raw.headers,
  });

  if (!sessionData) {
    c.set("session", null);
    c.set("user", null);
    await next();
    return;
  }

  c.set("session", sessionData.session);
  c.set("user", sessionData.user);
  await next();
};
