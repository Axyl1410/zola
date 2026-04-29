import { ApiException, fromHono } from "chanfana";
import { Hono } from "hono";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { DummyEndpoint } from "./endpoints/dummy-endpoint";
import { auth } from "./lib/auth";

// Start a Hono app
const app = new Hono<{
  Bindings: Env;
  Variables: {
    session: typeof auth.$Infer.Session.session | null;
    user: typeof auth.$Infer.Session.user | null;
  };
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

app.use("*", async (c, next) => {
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
});

app.onError((err, c) => {
  if (err instanceof ApiException) {
    // If it's a Chanfana ApiException, let Chanfana handle the response
    return c.json(
      { success: false, errors: err.buildResponse() },
      err.status as ContentfulStatusCode
    );
  }

  console.error("Global error handler caught:", err); // Log the error if it's not known

  // For other errors, return a generic 500 response
  return c.json(
    {
      success: false,
      errors: [{ code: 7000, message: "Internal Server Error" }],
    },
    500
  );
});

// Setup OpenAPI registry
const openapi = fromHono(app, {
  docs_url: "/",
  schema: {
    info: {
      title: "Zola API",
      version: "2.0.0",
      description:
        "This is the documentation for the Zola API, visit /api/auth/reference for the reference.",
    },
  },
});

// Register other endpoints
openapi.post("/dummy/:slug", DummyEndpoint);
app.on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw));

// Export the Hono app
export default app;
