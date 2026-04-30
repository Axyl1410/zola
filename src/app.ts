import { ApiException } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { sessionContextMiddleware } from "@/middlewares/session-context";
import { registerRoutes } from "@/routes/register-routes";
import type { AppInstance, AppVariables } from "@/types";

export function createApp(): AppInstance {
  const app = new Hono<{
    Bindings: Env;
    Variables: AppVariables;
  }>();

  app.use(
    "/api/auth/*",
    cors({
      allowHeaders: ["Content-Type", "Authorization"],
      allowMethods: ["GET", "POST", "OPTIONS"],
      credentials: true,
      exposeHeaders: ["Content-Length"],
      maxAge: 600,
      // In production, replace this with your frontend origin.
      origin: "*",
    })
  );

  app.use("*", sessionContextMiddleware);

  app.onError((err, c) => {
    if (err instanceof ApiException) {
      return c.json(
        { success: false, errors: err.buildResponse() },
        err.status as ContentfulStatusCode
      );
    }

    console.error("Global error handler caught:", err);

    return c.json(
      {
        success: false,
        errors: [{ code: 7000, message: "Internal Server Error" }],
      },
      500
    );
  });

  registerRoutes(app);
  return app;
}
