import { mergeFavouritesSchema } from "@wearly/shared/api/favourite-schemas";
import { API_ROUTES } from "@wearly/shared/api/routes";
import type { Listing } from "@wearly/shared/api/types";
import { authClient } from "@/lib/auth-client";

/**
 * The four favourites endpoints.
 *
 * `authClient.$fetch` resolves a relative path against the auth base URL
 * (`…/api/auth`), so every call passes the absolute API URL — the same
 * convention as the rest of the mobile services.
 *
 * The response is not run through `favouritesResponseSchema`: the Better Auth
 * JSON parser revives ISO datetimes into `Date` objects, which the shared
 * string-based `listingSchema` would reject. The envelope is checked instead,
 * so a malformed body still throws rather than rendering a fake heart.
 */

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

interface FetchError {
  message?: string;
}

interface FavouritesEnvelope {
  data?: { items?: Listing[] };
  error?: FetchError;
}

export async function getAccountFavourites(): Promise<Listing[]> {
  const result = (await authClient.$fetch(
    `${apiBase}${API_ROUTES.FAVOURITES.BASE}`
  )) as FavouritesEnvelope;
  const items = result.data?.items;
  if (result.error || !Array.isArray(items)) {
    throw new Error(result.error?.message ?? "Failed to load saved pieces");
  }
  return items;
}

export async function saveFavourite(listingId: string): Promise<void> {
  const result = (await authClient.$fetch(
    `${apiBase}${API_ROUTES.FAVOURITES.BASE}`,
    { body: { listingId }, method: "POST" }
  )) as { error?: FetchError };
  if (result.error) {
    throw new Error(result.error.message ?? "Could not save the piece");
  }
}

export async function removeFavourite(listingId: string): Promise<void> {
  const result = (await authClient.$fetch(
    `${apiBase}${API_ROUTES.FAVOURITES.BY_LISTING(listingId)}`,
    { method: "DELETE" }
  )) as { error?: FetchError };
  if (result.error) {
    throw new Error(result.error.message ?? "Could not update saved pieces");
  }
}

export async function mergeFavourites(listingIds: string[]): Promise<void> {
  const body = mergeFavouritesSchema.parse({ listingIds });
  const result = (await authClient.$fetch(
    `${apiBase}${API_ROUTES.FAVOURITES.MERGE}`,
    { body, method: "POST" }
  )) as { error?: FetchError };
  if (result.error) {
    throw new Error(result.error.message ?? "Could not merge saved pieces");
  }
}
