import { useQuery } from "@tanstack/react-query";

import type { Listing } from "@wearly/shared/api/types";
import { API_ROUTES } from "@wearly/shared/api/routes";

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

export function usePublicListings() {
  return useQuery<Listing[]>({
    enabled: true,
    queryFn: async () => {
      const response = await fetch(`${apiBase}${API_ROUTES.LISTINGS.PUBLIC}`);
      if (!response.ok) {
        throw new Error(`Failed to load listings (${response.status})`);
      }
      const data = (await response.json()) as Listing[];
      if (!Array.isArray(data)) {
        throw new Error("Failed to load listings");
      }
      return data;
    },
    queryKey: ["public-listings"],
    refetchOnMount: "always",
    staleTime: 0,
  });
}