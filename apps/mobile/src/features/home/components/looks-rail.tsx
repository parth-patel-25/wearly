import type { Piece } from "@shared/data/catalogue";
import { findPiece, formatRupees } from "@shared/data/catalogue";
import { AppList } from "@wearly/ui-native/app-list";
import { Button } from "@wearly/ui-native/button";
import { SectionHeader } from "@wearly/ui-native/display";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";
import type { Look } from "../home-data";

/**
 * Editorial outfit discovery.
 *
 * Complete looks, not garments: a magazine board where each card names the
 * occasion, lists the bundle and carries one rental price. Tapping opens the
 * hero piece — the look itself is inspiration, the product page is the action.
 */

interface LooksRailProps {
  looks: readonly Look[];
  onOpenLook: (pieceId: string) => void;
}

function lookPrice(pieceIds: readonly string[]): string {
  const total = pieceIds.reduce((sum, id) => {
    const piece: Piece | undefined = findPiece(id);
    return sum + (piece?.dailyRate ?? 0) * 2;
  }, 0);
  return `${formatRupees(total)} · 2 days`;
}

function LookCard({ look, onOpen }: { look: Look; onOpen: () => void }) {
  const hero: Piece | undefined = findPiece(look.pieceIds[0]);
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
        <Text variant="price">{lookPrice(look.pieceIds)}</Text>
        <View className="pt-2">
          <Button onPress={onOpen} size="sm" variant="outline">
            View look
          </Button>
        </View>
      </View>
    </View>
  );
}

export function LooksRail({ looks, onOpenLook }: LooksRailProps) {
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
          <LookCard look={item} onOpen={() => onOpenLook(item.pieceIds[0])} />
        )}
        separator={<View className="w-4" />}
        showsScrollIndicator={false}
      />
    </View>
  );
}
