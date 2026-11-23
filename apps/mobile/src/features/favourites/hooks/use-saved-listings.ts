import { useSession } from "@core/providers/session-provider";
import { useQuery } from "@tanstack/react-query";
import type { Piece } from "@shared/data/catalogue";
import { listingToPiece } from "@shared/data/listing-to-piece";
import { usePublicListings } from "@shared/hooks/use-public-listings";
import { useMemo } from "react";
import { getAccountFavourites } from "../services/favourites-api";
import { useFavourites } from "./use-favourites";

/**
 * The saved grid on Profile: the account's saved pieces when signed in
 * (`GET /api/favourites` — only saved pieces, not the whole public catalogue);
 * for guests, the public catalogue filtered by the local ids.
 *
 * Returned as `Piece`s: Profile already lays the grid out through
 * `useCatalogueGrid`, so the screen never learns which source they came from.
 */
export function useSavedListings(): readonly Piece[] {
  const { state } = useSession();
  const { ids } = useFavourites();
  const { data: accountFavourites } = useQuery({
    enabled: state.isAuthenticated,
    queryKey: ["favourites"],
    queryFn: getAccountFavourites,
  });
  const { data: publicListings } = usePublicListings();

  return useMemo(() => {
    if (state.isAuthenticated) {
      return (accountFavourites ?? []).map((listing) => listingToPiece(listing));
    }
    const byId = new Map((publicListings ?? []).map((listing) => [listing.id, listing]));
    return [...new Set(ids)].flatMap((id) => {
      const listing = byId.get(id);
      return listing ? [listingToPiece(listing)] : [];
    });
  }, [accountFavourites, ids, publicListings, state.isAuthenticated]);
}
