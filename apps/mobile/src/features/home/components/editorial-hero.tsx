import type { Piece } from "@shared/data/catalogue";
import { Button } from "@wearly/ui-native/button";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { Pressable, View } from "react-native";
import { HOME_HERO } from "../home-data";

/**
 * Editorial hero.
 *
 * Occasion-led, never discount-led. One photograph, short editorial copy, one
 * CTA. Rounded premium composition — a magazine cover, not an advertisement.
 */

interface EditorialHeroProps {
  onExplore: () => void;
  piece: Piece;
}

export function EditorialHero({ onExplore, piece }: EditorialHeroProps) {
  return (
    <Pressable
      accessibilityLabel={`${HOME_HERO.title}. ${HOME_HERO.subtitle}`}
      accessibilityRole="button"
      className="overflow-hidden rounded-card border border-border bg-card active:bg-muted"
      onPress={onExplore}
    >
      <Media aspect="16/9" src={piece.images[0]} tone={piece.gallery[0]} />
      <View className="gap-2 p-5">
        <Text tone="primary" variant="label">
          {HOME_HERO.caption}
        </Text>
        <Text variant="headingXl">{HOME_HERO.title}</Text>
        <Text tone="muted-foreground" variant="bodyMd">
          {HOME_HERO.subtitle}
        </Text>
        <View className="pt-2">
          <Button onPress={onExplore} size="sm">
            {HOME_HERO.cta}
          </Button>
        </View>
      </View>
    </Pressable>
  );
}
