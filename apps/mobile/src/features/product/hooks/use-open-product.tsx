import { ROUTES } from "@core/routing/routes";
// findPiece removed with dummy data; hero expansion is skipped for uploaded listings.
import { useHero } from "@wearly/ui-native/hero-provider";

import type { ProductCardFrame } from "@wearly/ui-native/product-card";
import { useRouter } from "expo-router";
import { useCallback } from "react";

/**
 * Opening a product, with the hero expansion.
 *
 * The two things that have to happen in the right order:
 *
 * 1. Record the tapped card's frame, *including* the media it should show. The
 *    expansion is a real surface, not a coloured rectangle — if the card showed a
 *    particular tone, the expanding surface has to show the same one or the swap
 *    is visible.
 * 2. Navigate. Immediately. The overlay is already growing by the time the route
 *    settles, so the page arrives under the expansion rather than after it.
 *
 * A zero-sized frame means the card was not laid out (a deep link, or a web
 * preview where measurement can land a frame late). The hero provider treats that
 * as "no expansion" and just navigates, so the flow never depends on a
 * measurement having succeeded.
 */
export function useOpenProduct(): (
  id: string,
  _frame: ProductCardFrame
) => void {
  const router = useRouter();
  const { begin } = useHero();

  return useCallback(
    (id: string, _frame: ProductCardFrame) => {
      // hero expansion skipped (no dummy catalogue)

      router.push(ROUTES.product(id));
    },
    [begin, router]
  );
}
