import { useFavourites } from "@features/favourites/hooks/use-favourites";
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
  pieces: readonly Piece[] = CATALOGUE,
): CatalogueGrid {
  const { ids, toggle } = useFavourites();

  const onFavourite = useCallback((id: string) => toggle(id), [toggle]);
  const favourites = useMemo(() => new Set(ids), [ids]);
  const items = useMemo(() => pieces.map(toCardItem), [pieces]);

  return { favourites, items, onFavourite };
}

export function toCardItem(piece: Piece): ProductGridItem {
  return {
    fact: (piece.distanceBand ?? piece.areaLabel) || piece.category,
    id: piece.id,
    name: piece.name,
    notice: piece.status !== "published" ? "No longer available" : undefined,
    placeholderTone: piece.gallery[0] ?? "muted",
    price: rentalSummary(piece, 3),
    src: piece.images[0],
  };
}
