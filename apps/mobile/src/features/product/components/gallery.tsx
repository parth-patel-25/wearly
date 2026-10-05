import type { Piece } from "@shared/data/catalogue";
import { Media } from "@wearly/ui-native/media";
import { Text } from "@wearly/ui-native/text";
import { useState } from "react";
import { Pressable, View } from "react-native";

/**
 * The image gallery.
 *
 * A three-frame strip with dot indicators rather than a full-bleed pager,
 * because on a phone the strip lets a renter see everything at once — and the
 * decision to rent is a decision about all the angles.
 *
 * The strip is a *strip*, so it sits in the normal vertical flow and the page
 * below it starts where the imagery ends. A full-bleed hero would push the price,
 * which is the second most important thing on the screen, below the fold.
 */

export interface GalleryProps {
  onSelect?: (index: number) => void;
  piece: Piece;
}

export function Gallery({ onSelect, piece }: GalleryProps) {
  const [index, setIndex] = useState(0);

  const select = (position: number) => {
    setIndex(index === position ? index : position);
    onSelect?.(position);
  };

  // Frames are keyed by URL rather than position: a key derived from the index
  // silently reorders itself if the array is ever rebuilt differently, and every
  // angle is a distinct photograph here.
  const frames = piece.images.map((src, position) => ({
    key: `${piece.id}-${position}-${src}`,
    position,
    src,
  }));
  const activeFrame = frames.find((frame) => frame.position === index);

  return (
    <View className="gap-3">
      <View className="flex-row gap-2 px-gutter">
        {frames.map((frame) => (
          <Pressable
            accessibilityLabel={`View image ${frame.position + 1} of ${frames.length}`}
            accessibilityRole="button"
            accessibilityState={{ selected: frame.position === index }}
            className="flex-1"
            key={frame.key}
            onPress={() => select(frame.position)}
          >
            <Media aspect="1/1" src={frame.src} tone={piece.gallery[0]} />
          </Pressable>
        ))}
      </View>

      <View className="flex-row items-center justify-between px-gutter">
        <View className="flex-row gap-2">
          {frames.map((frame) => (
            <View
              className={`h-1.5 rounded-pill ${frame.position === index ? "w-5 bg-primary" : "w-1.5 bg-border"}`}
              key={frame.key}
            />
          ))}
        </View>
        <Text tone="muted-foreground" variant="caption">
          {activeFrame === undefined
            ? "Photo"
            : `Photo ${index + 1} of ${frames.length}`}
        </Text>
      </View>
    </View>
  );
}
