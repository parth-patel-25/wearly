import { useRef } from "react";
import { View } from "react-native";

import { Icon } from "./icon";
import type { PlaceholderTone } from "./media";
import { Media } from "./media";
import { AnimatedPressable, useHeartPop, usePressScale } from "./motion";
import { Text } from "./text";

/**
 * The product card — the most important component in the product.
 *
 * Three rules do the work here:
 *
 * 1. **The image dominates.** A 4:5 media block, one name, one price, and at
 *    most one more fact. A card that shows everything communicates nothing, so
 *    low-value facts are omitted rather than shrunk.
 *
 * 2. **The favourite button lives inside the media block.** It is a translucent
 *    pill in the bottom-right corner of the image area, clipped by the media's own
 *    radius, so the card's picture and its one control read as a single object
 *    instead of two stacked blocks. This is the one place the card uses absolute
 *    positioning, and it is an overlay rather than a layout strategy: the
 *    position is anchored to the image, not used to arrange anything.
 *
 * 3. **The card measures itself.** On press it reports where its media actually
 *    is, in window coordinates. That rectangle is the origin of the hero
 *    expansion, so it has to come from the real laid-out node — deriving it from
 *    the grid's column arithmetic is only ever an approximation, and a wrong
 *    origin makes the signature interaction look like a glitch.
 */

const EMPTY_FRAME = { height: 0, width: 0, x: 0, y: 0 };

export interface ProductCardFrame {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface ProductCardProps {
  /** Facts below the name. Capped at one — the caller decides which matters. */
  fact?: string;
  /** Stable identity, used for list keys and favourites. */
  id: string;
  isFavourite: boolean;
  name: string;
  onFavourite: () => void;
  onPress: (frame: ProductCardFrame) => void;
  placeholderTone: PlaceholderTone;
  price: string;
}

export function ProductCard({
  fact,
  isFavourite,
  name,
  onFavourite,
  onPress,
  price,
  placeholderTone,
}: ProductCardProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.985);
  const heart = useHeartPop();
  const media = useRef<View | null>(null);

  const handleFavourite = () => {
    heart.pop();
    onFavourite();
  };

  // The ref really is null before the first layout, and pressing a card that has
  // never been measured must still navigate — just without the expansion.
  const handlePress = () => {
    const node = media.current;
    if (node === null) {
      onPress(EMPTY_FRAME);
      return;
    }
    node.measureInWindow((x, y, width, height) =>
      onPress({ height, width, x, y })
    );
  };

  return (
    <AnimatedPressable
      accessibilityLabel={`${name}, ${price}`}
      accessibilityRole="button"
      className="flex-1 flex-col gap-2"
      onPress={handlePress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      <View className="overflow-hidden rounded-media">
        <View ref={media}>
          <Media aspect="4/5" tone={placeholderTone} />
        </View>

        <AnimatedPressable
          accessibilityLabel={
            isFavourite ? `Remove ${name} from saved` : `Save ${name}`
          }
          accessibilityRole="button"
          accessibilityState={{ selected: isFavourite }}
          className={`absolute right-2 bottom-2 size-11 items-center justify-center rounded-pill ${isFavourite ? "bg-card" : "bg-card/90"}`}
          hitSlop={6}
          onPress={handleFavourite}
          style={heart.animatedStyle}
        >
          <Icon
            name={isFavourite ? "heart-filled" : "heart"}
            size="sm"
            tone={isFavourite ? "primary" : "foreground"}
          />
        </AnimatedPressable>
      </View>

      <View className="flex-col gap-0.5">
        <Text numberOfLines={1} variant="bodyMd">
          {name}
        </Text>
        <Text variant="price">{price}</Text>
        {fact ? (
          <Text numberOfLines={1} tone="muted-foreground" variant="caption">
            {fact}
          </Text>
        ) : null}
      </View>
    </AnimatedPressable>
  );
}
