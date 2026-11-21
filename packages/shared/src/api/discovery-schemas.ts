import { z } from "zod";
import { listingSchema } from "./listing-schemas.js";
import { isoDaySchema } from "./rental-schemas.js";

/**
 * Nearby discovery.
 *
 * This is a `POST` on purpose: search coordinates must not end up in a URL,
 * access log or proxy log. `availableFrom` / `availableTo` are the requested
 * rental window; a listing blocked on any of those days scores lower and is not
 * offered as a match.
 */
export const discoverListingsSchema = z
  .object({
    availableFrom: isoDaySchema.optional(),
    availableTo: isoDaySchema.optional(),
    categories: z.array(z.string().trim().min(1)).max(12).optional(),
    conditions: z.array(z.string().trim().min(1)).max(12).optional(),
    latitude: z.number().min(-90).max(90).optional(),
    limit: z.number().int().min(1).max(50).default(24),
    longitude: z.number().min(-180).max(180).optional(),
    maxDailyRate: z.number().int().positive().optional(),
    offset: z.number().int().min(0).default(0),
    query: z.string().trim().max(120).optional(),
    radiusMeters: z.number().int().min(100).max(5000).default(5000),
    sizes: z.array(z.string().trim().min(1)).max(12).optional(),
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
    if (
      value.availableFrom !== undefined &&
      value.availableTo !== undefined &&
      value.availableTo < value.availableFrom
    ) {
      ctx.addIssue({
        code: "custom",
        message: "availableTo cannot be before availableFrom",
        path: ["availableTo"],
      });
    }
  });
export type DiscoverListingsInput = z.infer<typeof discoverListingsSchema>;

export const discoveryListingSchema = listingSchema.extend({
  /** Display band label, e.g. "50–100 m"; null when the listing has no location. */
  distanceBand: z.string().nullable(),
  /** Rounded for display. The underlying coordinates never leave the API. */
  distanceMeters: z.number().nonnegative().nullable(),
});
export type DiscoveryListing = z.infer<typeof discoveryListingSchema>;

export const discoverListingsResponseSchema = z.object({
  items: z.array(discoveryListingSchema),
  limit: z.number().int().positive(),
  offset: z.number().int().nonnegative(),
  radiusMeters: z.number().int().positive(),
  total: z.number().int().nonnegative(),
});
export type DiscoverListingsResponse = z.infer<
  typeof discoverListingsResponseSchema
>;
