import { API_ROUTES } from "@wearly/shared/api/routes";
import type { StorageFolder } from "@wearly/shared/enums";
import { authClient } from "@/lib/auth-client";
import { createLogger } from "@/shared/lib/logger";

const logger = createLogger("UploadImage");

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

/** The subset of an `expo-image-picker` asset this pipeline needs. */
export interface UploadableAsset {
  fileName?: string | null;
  mimeType?: string | null;
  uri: string;
}

export interface UploadedImage {
  path: string;
  publicUrl: string;
}

/**
 * Upload one picked image to the shared Supabase bucket.
 *
 * The API issues a short-lived signed upload URL (session-scoped, so the
 * caller must be signed in); the binary then goes straight to Supabase with a
 * plain `PUT`, and the answer carries the bucket-relative path and the
 * permanent public URL. Throws an `Error` with a human-readable message on
 * any failure — callers decide how to surface it.
 */
export async function uploadImage(
  asset: UploadableAsset,
  folder: StorageFolder
): Promise<UploadedImage> {
  const contentType = asset.mimeType ?? "image/jpeg";
  const filename = asset.fileName ?? `upload-${Date.now()}.jpg`;

  const result = (await authClient.$fetch(
    `${apiBase}${API_ROUTES.STORAGE.UPLOAD_URL}`,
    {
      body: { contentType, filename, folder },
      method: "POST",
    }
  )) as {
    data?: { path: string; publicUrl: string; uploadUrl: string };
    error?: { message?: string };
  };

  if (result.error || !result.data) {
    logger.error("Signed upload URL request failed", {
      message: result.error?.message,
    });
    throw new Error(result.error?.message ?? "Failed to get upload URL");
  }

  const signed = result.data;
  const fileRes = await fetch(asset.uri);
  const buffer = await fileRes.arrayBuffer();
  const uploadRes = await fetch(signed.uploadUrl, {
    body: buffer,
    headers: { "content-type": contentType },
    method: "PUT",
  });

  if (!uploadRes.ok) {
    logger.error("Storage upload failed", { status: uploadRes.status });
    throw new Error(`Upload failed (${uploadRes.status})`);
  }

  return { path: signed.path, publicUrl: signed.publicUrl };
}
