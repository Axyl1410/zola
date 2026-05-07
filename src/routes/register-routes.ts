import { fromHono } from "chanfana";
import { registerAuthModule } from "@/features/auth/register-auth-module";
import { registerDummyModule } from "@/features/dummy/register-dummy-module";
import { registerUploadModule } from "@/features/upload/register-upload-module";
import type { AppInstance } from "@/types";

export function registerRoutes(app: AppInstance) {
  const openApiSchema = {
    info: {
      title: "Zola API",
      version: "2.0.0",
      description:
        "This is the documentation for the Zola API, visit /api/auth/reference for the reference.",
    },
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
        },
      },
    },
  } as const;

  const openapi = fromHono(app, {
    docs_url: "/",
    schema: openApiSchema as unknown as Record<string, unknown>,
  });

  registerDummyModule(app, openapi);
  registerAuthModule(app);
  registerUploadModule(app, openapi);
}
