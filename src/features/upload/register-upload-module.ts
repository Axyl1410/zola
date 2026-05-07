import { UploadParamsEndpoint } from "@/endpoints/upload-params-endpoint";
import type { AppInstance } from "@/types";

interface UploadOpenApiRegistry {
  get: (path: string, endpoint: typeof UploadParamsEndpoint) => unknown;
}

export function registerUploadModule(
  _app: AppInstance,
  openapi: UploadOpenApiRegistry
) {
  openapi.get("/api/upload-params", UploadParamsEndpoint);
}
