import { DummyEndpoint } from "@/endpoints/dummy-endpoint";

interface DummyOpenApiRegistry {
  post: (path: string, endpoint: typeof DummyEndpoint) => unknown;
}

export function registerDummyModule(openapi: DummyOpenApiRegistry) {
  openapi.post("/dummy/:slug", DummyEndpoint);
}
