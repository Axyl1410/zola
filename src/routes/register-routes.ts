import { fromHono } from "chanfana";
import { registerAuthModule } from "@/features/auth/register-auth-module";
import { registerDummyModule } from "@/features/dummy/register-dummy-module";
import type { AppInstance } from "@/types";

export function registerRoutes(app: AppInstance) {
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

  registerDummyModule(app, openapi);
  registerAuthModule(app);
}
