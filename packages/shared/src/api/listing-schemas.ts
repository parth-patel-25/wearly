import { z } from "zod";
import {
  CONDITION_VALUES,
  LISTING_STATUS_VALUES,
  STORAGE_FOLDER_VALUES,
  STORAGE_FOLDERS,
  SUPPORTED_FULFILLMENT_METHODS,
} from "../enums/index.js";

/**
 * Listing contracts.
 *
 * Coordinates are write-only: `createListingSchema` accepts them so the API can
 * rank nearby listings, but `listingSchema` deliberately has no latitude or
 * longitude. A public response can only carry an area label.
 */
export const createListingSchema = z
  .object({
    areaLabel: z.string().trim().max(80).optional(),
    availability: z.array(z.string()).optional(),
    brand: z.string().optional(),
    category: z.string().min(1),
    color: z.string().optional(),
    condition: z.enum(CONDITION_VALUES),
    description: z.string().optional(),
    /** In-person only for now; the enum is narrowed at the boundary. */
    fulfillmentMethods: z
      .array(z.enum(SUPPORTED_FULFILLMENT_METHODS))
      .max(1)
      .optional(),
    latitude: z.number().min(-90).max(90).optional(),
    longitude: z.number().min(-180).max(180).optional(),
    material: z.string().optional(),
    photos: z.array(z.string()).optional(),
    pricePerDay: z.string().min(1),
    size: z.string().min(1),
    status: z.enum(LISTING_STATUS_VALUES).optional(),
    subcategory: z.string().optional(),
    title: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    const hasLatitude = value.latitude !== undefined;
    const hasLongitude = value.longitude !== undefined;
    if (hasLatitude !== hasLongitude) {
      ctx.addIssue({
        code: "custom",
        message: "latitude and longitude must be sent together",
        path: ["latitude"],
      });
    }
  });
export type CreateListingInput = z.infer<typeof createListingSchema>;

export const listingSchema = z.object({
  areaLabel: z.string().nullable().optional(),
  availability: z.array(z.string()).optional(),
  brand: z.string().nullable().optional(),
  category: z.string(),
  color: z.string().nullable().optional(),
  condition: z.string(),
  createdAt: z.string(),
  description: z.string().nullable().optional(),
  id: z.string(),
  lenderId: z.string(),
  lenderImage: z.string().nullable().optional(),
  lenderName: z.string().nullable().optional(),
  material: z.string().nullable().optional(),
  photos: z.array(z.string()).optional(),
  pricePerDay: z.string(),
  size: z.string(),
  status: z.enum(LISTING_STATUS_VALUES),
  subcategory: z.string().nullable().optional(),
  title: z.string(),
  updatedAt: z.string(),
});
export type Listing = z.infer<typeof listingSchema>;

/** Body accepted by `POST /storage/upload-url`. */
export const createUploadUrlSchema = z.object({
  contentType: z.string().min(1),
  filename: z.string().min(1).max(255),
  /** Bucket folder; defaults to `listings` so existing callers are unchanged. */
  folder: z.enum(STORAGE_FOLDER_VALUES).default(STORAGE_FOLDERS.LISTINGS),
});
export type CreateUploadUrlInput = z.infer<typeof createUploadUrlSchema>;

/** Response of `POST /storage/upload-url`. */
export const createUploadUrlResponseSchema = z.object({
  path: z.string().min(1),
  publicUrl: z.string().url(),
  uploadUrl: z.string().url(),
});
export type CreateUploadUrlResponse = z.infer<
  typeof createUploadUrlResponseSchema
>;
