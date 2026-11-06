/**
 * Upload folders inside the shared Supabase storage bucket.
 *
 * One bucket serves every image; the top-level folder is what keeps listing
 * photos and avatars apart, so the tuple also drives the Zod schema for
 * `POST /storage/upload-url`.
 */
export const STORAGE_FOLDERS = {
  AVATARS: "avatars",
  LISTINGS: "listings",
} as const;

export const STORAGE_FOLDER_VALUES = [
  STORAGE_FOLDERS.LISTINGS,
  STORAGE_FOLDERS.AVATARS,
] as const;

export type StorageFolder = (typeof STORAGE_FOLDER_VALUES)[number];
