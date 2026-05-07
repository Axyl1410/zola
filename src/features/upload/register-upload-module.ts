import { auth } from "@/lib/auth";
import { createFinalObjectUrl, createPresignedUploadUrl } from "@/lib/s3";
import type { AppInstance } from "@/types";

const DEFAULT_EXPIRES_IN_SECONDS = 3600;

export function registerUploadModule(app: AppInstance) {
  app.get("/api/upload-params", async (c) => {
    const key = c.req.query("key");
    const contentType = c.req.query("contentType");
    const expiresInParam = c.req.query("expiresIn");
    const expiresIn = Number(expiresInParam ?? DEFAULT_EXPIRES_IN_SECONDS);

    const hasMissingRequiredParams =
      key === undefined || contentType === undefined;

    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    if (hasMissingRequiredParams) {
      return c.json(
        {
          error: "Missing required query params: key, contentType",
        },
        400
      );
    }

    if (!Number.isInteger(expiresIn) || expiresIn <= 0) {
      return c.json(
        {
          error: "expiresIn must be a positive integer",
        },
        400
      );
    }

    const uploadUrl = await createPresignedUploadUrl({
      key,
      contentType,
      expiresIn,
    });

    const finalUrl = createFinalObjectUrl(key);

    return c.json({
      uploadUrl,
      finalUrl,
    });
  });
}
