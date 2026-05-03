import { DummyEndpoint } from "@/endpoints/dummy-endpoint";
import { rateLimitMiddleware } from "@/middlewares/ratelimit-middleware";
import type { AppInstance } from "@/types";

interface DummyOpenApiRegistry {
  post: (path: string, endpoint: typeof DummyEndpoint) => unknown;
}

export function registerDummyModule(
  app: AppInstance,
  openapi: DummyOpenApiRegistry
) {
  app.use("/dummy/*", rateLimitMiddleware({ limit: 3 }));
  openapi.post("/dummy/:slug", DummyEndpoint);
}
