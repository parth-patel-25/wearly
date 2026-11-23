import { authClient } from "@/lib/auth-client";
import { favouritesResponseSchema, mergeFavouritesSchema } from "@wearly/shared/api/favourite-schemas";
import { API_ROUTES } from "@wearly/shared/api/routes";
import type { Listing } from "@wearly/shared/api/types";

/**
 * The four favourites endpoints, through the Better Auth client — the session
 * cookie goes out with the request, no tokens in URLs. Responses parse against
 * the shared schemas so a malformed body throws rather than rendering a fake
 * heart.
 */

export async function getAccountFavourites(): Promise<Listing[]> {
  const { data, error } = await authClient.$fetch(API_ROUTES.FAVOURITES.BASE);
  if (error || !data) {
    throw new Error("Failed to load saved pieces");
  }
  return favouritesResponseSchema.parse(data).items;
}

export async function saveFavourite(listingId: string): Promise<void> {
  const { error } = await authClient.$fetch(API_ROUTES.FAVOURITES.BASE, {
    body: JSON.stringify({ listingId }),
    method: "POST",
  });
  if (error) {
    throw new Error(error.message ?? "Could not save the piece");
  }
}

export async function removeFavourite(listingId: string): Promise<void> {
  const { error } = await authClient.$fetch(API_ROUTES.FAVOURITES.BY_LISTING(listingId), {
    method: "DELETE",
  });
  if (error) {
    throw new Error(error.message ?? "Could not update saved pieces");
  }
}

export async function mergeFavourites(listingIds: string[]): Promise<void> {
  const { error } = await authClient.$fetch(API_ROUTES.FAVOURITES.MERGE, {
    body: JSON.stringify({ listingIds: mergeFavouritesSchema.parse({ listingIds }).listingIds }),
    method: "POST",
  });
  if (error) {
    throw new Error(error.message ?? "Could not merge saved pieces");
  }
}
