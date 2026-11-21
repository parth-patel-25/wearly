import type { Filters } from "@shared/data/filters";
import { useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@wearly/shared/api/routes";
import type {
  DiscoverListingsInput,
  DiscoverListingsResponse,
} from "@wearly/shared/api/types";
import type { NearbyCoordinates } from "./use-nearby-location";

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Discovery is a `POST` so coordinates never enter a URL or a log, and it is
 * anonymous so browsing works before sign-in. The server owns ranking, so the
 * app sends what the user asked for and renders what comes back — no local
 * re-filtering that could disagree with the distance rules.
 */
export function useDiscoverListings(
  query: string,
  filters: Filters,
  coords: NearbyCoordinates | null
) {
  const body: DiscoverListingsInput = {
    // "Available from" is a start day, and the API scores a blocked window
    // only when it has both ends. A same-day window is the honest reading: this
    // is the day the renter wants, not a duration the app invented.
    availableFrom: filters.from ?? undefined,
    availableTo: filters.from ?? undefined,
    categories:
      filters.categories.length > 0 ? [...filters.categories] : undefined,
    conditions:
      filters.conditions.length > 0 ? [...filters.conditions] : undefined,
    latitude: coords?.latitude,
    limit: 40,
    longitude: coords?.longitude,
    maxDailyRate: filters.maxDailyRate ?? undefined,
    offset: 0,
    query: query.trim().length > 0 ? query.trim() : undefined,
    radiusMeters: 5000,
    sizes: filters.sizes.length > 0 ? [...filters.sizes] : undefined,
  };

  return useQuery<DiscoverListingsResponse>({
    queryFn: async () => {
      const response = await fetch(
        `${apiBase}${API_ROUTES.LISTINGS.DISCOVER}`,
        {
          body: JSON.stringify(body),
          headers: { "Content-Type": "application/json" },
          method: "POST",
        }
      );
      if (!response.ok) {
        throw new Error(`Could not load pieces (${response.status})`);
      }
      return (await response.json()) as DiscoverListingsResponse;
    },
    queryKey: ["discover", body],
    staleTime: 30_000,
  });
}
