import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/utils/cf-util";

const TRAILING_SLASHES_REGEX = /\/+$/;
const LEADING_SLASHES_REGEX = /^\/+/;

const S3 = new S3Client({
  region: "auto",
  endpoint: `https://${env.CLOUDFLARE_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: env.R2_ACCESS_KEY_ID,
    secretAccessKey: env.R2_SECRET_ACCESS_KEY,
  },
});

interface CreatePresignedUploadUrlInput {
  contentType: string;
  expiresIn: number;
  key: string;
}

const encodeObjectKey = (key: string): string =>
  key
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");

export const createPresignedUploadUrl = async ({
  key,
  contentType,
  expiresIn,
}: CreatePresignedUploadUrlInput): Promise<string> => {
  const command = new PutObjectCommand({
    Bucket: env.R2_BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  });

  return await getSignedUrl(S3, command, { expiresIn });
};

export const createFinalObjectUrl = (key: string): string => {
  const encodedKey = encodeObjectKey(key);
  const baseUrl = env.R2_PUBLIC_BASE_URL.replace(TRAILING_SLASHES_REGEX, "");
  return `${baseUrl}/${encodedKey}`;
};

export const getObjectKeyFromUrl = (input: string): string | null => {
  let url: URL;
  try {
    url = new URL(input);
  } catch {
    return null;
  }

  const publicBaseUrl = env.R2_PUBLIC_BASE_URL.replace(
    TRAILING_SLASHES_REGEX,
    ""
  );
  const normalizedInput = url.toString().replace(TRAILING_SLASHES_REGEX, "");

  // Public URL style: `${R2_PUBLIC_BASE_URL}/${key}`
  if (normalizedInput.startsWith(publicBaseUrl)) {
    const relative = url.pathname.replace(LEADING_SLASHES_REGEX, "");
    if (!relative) {
      return null;
    }
    return relative
      .split("/")
      .map((part) => decodeURIComponent(part))
      .join("/");
  }

  // S3 API endpoint style for R2: `https://<account>.r2.cloudflarestorage.com/<bucket>/<key>`
  const pathnameParts = url.pathname
    .split("/")
    .filter((part) => part.length > 0)
    .map((part) => decodeURIComponent(part));

  if (pathnameParts.length >= 2 && pathnameParts[0] === env.R2_BUCKET_NAME) {
    return pathnameParts.slice(1).join("/");
  }

  // Fallback: treat full path as key (useful for custom domains where bucket isn't in path)
  const fallback = url.pathname.replace(LEADING_SLASHES_REGEX, "");
  if (!fallback) {
    return null;
  }
  return fallback
    .split("/")
    .map((part) => decodeURIComponent(part))
    .join("/");
};

export const deleteObjectByKey = async (key: string): Promise<void> => {
  const { DeleteObjectCommand } = await import("@aws-sdk/client-s3");

  await S3.send(
    new DeleteObjectCommand({
      Bucket: env.R2_BUCKET_NAME,
      Key: key,
    })
  );
};

export const deleteObjectByUrl = async (url: string): Promise<void> => {
  const key = getObjectKeyFromUrl(url);
  if (!key) {
    return;
  }
  await deleteObjectByKey(key);
};

export default S3;
