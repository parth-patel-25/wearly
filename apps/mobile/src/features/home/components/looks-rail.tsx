import type { Piece } from "@shared/data/catalogue";
import { formatRupees } from "@shared/data/catalogue";
import { AppList } from "@wearly/ui-native/app-list";
import { Button } from "@wearly/ui-native/button";
import { SectionHeader } from "@wearly/ui-native/display";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { useMemo } from "react";
import { View } from "react-native";
import type { Look } from "../home-data";

/**
 * Editorial outfit discovery.
 *
 * Complete looks, not garments: a magazine board where each card names the
 * occasion, lists the bundle and carries one rental price. Tapping opens the
 * hero piece — the look itself is inspiration, the product page is the action.
 *
 * Look ids are built from the live catalogue, so pieces must be resolved
 * against that same list. `findPiece` reads the static prototype catalogue and
 * returns nothing for API ids, which rendered every card as an empty image
 * with a ₹0 price.
 */

const RENTAL_DAYS = 2;

interface LooksRailProps {
  looks: readonly Look[];
  onOpenLook: (pieceId: string) => void;
  pieces: readonly Piece[];
}

function lookPrice(
  pieceIds: readonly string[],
  byId: ReadonlyMap<string, Piece>
): string {
  const total = pieceIds.reduce(
    (sum, id) => sum + (byId.get(id)?.dailyRate ?? 0) * RENTAL_DAYS,
    0
  );
  return `${formatRupees(total)} · ${RENTAL_DAYS} days`;
}

interface LookCardProps {
  hero: Piece | undefined;
  look: Look;
  onOpen: () => void;
  price: string;
}

function LookCard({ hero, look, onOpen, price }: LookCardProps) {
  return (
    <View className="w-64 gap-3 overflow-hidden rounded-card border border-border bg-card">
      <Media
        aspect="3/4"
        src={hero?.images[0]}
        tone={hero?.gallery[1] ?? "muted"}
      />
      <View className="gap-1 px-4 pb-4">
        <Text variant="headingSm">{look.name}</Text>
        <Text tone="muted-foreground" variant="caption">
          {look.bundle}
        </Text>
        <Text variant="price">{price}</Text>
        <View className="pt-2">
          <Button onPress={onOpen} size="sm" variant="outline">
            View look
          </Button>
        </View>
      </View>
    </View>
  );
}

export function LooksRail({ looks, onOpenLook, pieces }: LooksRailProps) {
  const byId = useMemo(
    () => new Map(pieces.map((piece) => [piece.id, piece])),
    [pieces]
  );

  return (
    <View className="gap-4">
      <SectionHeader
        caption="Styled outfits, ready to rent"
        title="Looks people are loving"
      />
      <AppList
        data={[...looks]}
        horizontal
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <LookCard
            hero={byId.get(item.pieceIds[0])}
            look={item}
            onOpen={() => onOpenLook(item.pieceIds[0])}
            price={lookPrice(item.pieceIds, byId)}
          />
        )}
        separator={<View className="w-4" />}
        showsScrollIndicator={false}
      />
    </View>
  );
}
