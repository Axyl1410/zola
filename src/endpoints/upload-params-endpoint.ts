import { contentJson, OpenAPIRoute } from "chanfana";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { createFinalObjectUrl, createPresignedUploadUrl } from "@/lib/s3";
import type { AppContext } from "@/types";

const DEFAULT_EXPIRES_IN_SECONDS = 3600;

export class UploadParamsEndpoint extends OpenAPIRoute {
  schema = {
    tags: ["Upload"],
    summary: "Get upload URL and final object URL",
    operationId: "get-upload-params",
    request: {
      headers: z
        .object({
          authorization: z.string().optional(),
          cookie: z.string().optional(),
        })
        .passthrough(),
      query: z.object({
        key: z.string().min(1),
        contentType: z.string().min(1),
        expiresIn: z.coerce.number().int().positive().default(DEFAULT_EXPIRES_IN_SECONDS),
      }),
    },
    responses: {
      "200": {
        description: "Upload parameters generated successfully",
        ...contentJson(
          z.object({
            uploadUrl: z.string().url(),
            finalUrl: z.string().url(),
          })
        ),
      },
      "401": {
        description: "Unauthorized",
        ...contentJson(
          z.object({
            error: z.string(),
          })
        ),
      },
    },
  };

  async handle(c: AppContext) {
    const session = await auth.api.getSession({ headers: c.req.raw.headers });

    if (!session) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const data = await this.getValidatedData<typeof this.schema>();

    const uploadUrl = await createPresignedUploadUrl({
      key: data.query.key,
      contentType: data.query.contentType,
      expiresIn: data.query.expiresIn,
    });

    const finalUrl = createFinalObjectUrl(data.query.key);

    return {
      uploadUrl,
      finalUrl,
    };
  }
}
