import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "@/utils/cf-util";

const TRAILING_SLASHES_REGEX = /\/+$/;

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

export default S3;
