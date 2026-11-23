import { z } from "zod";
import { listingSchema } from "./listing-schemas.js";

/** One favourited listing, by id. */
export const favouriteInputSchema = z.object({
  listingId: z.uuid(),
});
export type FavouriteInput = z.infer<typeof favouriteInputSchema>;

/**
 * Merge payload for the guest device on sign-in. The server unions the ids
 * with the account's favourites; unknown or foreign ids are ignored, so the
 * merge is idempotent end to end.
 */
export const mergeFavouritesSchema = z.object({
  listingIds: z.array(z.uuid()).max(200),
});
export type MergeFavouritesInput = z.infer<typeof mergeFavouritesSchema>;

/** The full saved-piece list, after any mutation, newest first. */
export const favouritesResponseSchema = z.object({
  items: z.array(listingSchema),
});
export type FavouritesResponse = z.infer<typeof favouritesResponseSchema>;
