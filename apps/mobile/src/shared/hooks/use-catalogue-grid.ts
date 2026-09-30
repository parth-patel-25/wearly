import { useSession } from "@core/providers/session-provider";

import type { ProductGridItem } from "@wearly/ui-native/product-grid";
import { useCallback, useMemo } from "react";
import type { Piece } from "../data/catalogue";
import { CATALOGUE, rentalSummary } from "../data/catalogue";

/**
 * The one place a `Piece` becomes a card.
 *
 * Every grid in the app — home, discover, saved — shows the same shape, and the
 * rule that keeps it honest is that a card carries a name, a price and at most
 * one more fact. Deciding that here means no screen can quietly grow a fourth.
 */

export interface CatalogueGrid {
  favourites: ReadonlySet<string>;
  items: readonly ProductGridItem[];
  onFavourite: (id: string) => void;
}

export function useCatalogueGrid(
  pieces: readonly Piece[] = CATALOGUE
): CatalogueGrid {
  const { dispatch, state } = useSession();

  const onFavourite = useCallback(
    (id: string) => dispatch({ pieceId: id, type: "toggle-favourite" }),
    [dispatch]
  );

  const favourites = useMemo(
    () => new Set(state.favourites),
    [state.favourites]
  );
  const items = useMemo(() => pieces.map(toCardItem), [pieces]);

  return { favourites, items, onFavourite };
}

export function toCardItem(piece: Piece): ProductGridItem {
  return {
    fact: piece.lender.neighbourhood,
    id: piece.id,
    name: piece.name,
    placeholderTone: piece.gallery[0],
    price: rentalSummary(piece, 3),
    src: piece.images[0],
  };
}
