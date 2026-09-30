import type { Piece } from "@shared/data/catalogue";
import { CONDITION_LABEL, rentalSummary, sizeOf } from "@shared/data/catalogue";
import { Badge } from "@wearly/ui-native/badge";
import { Card } from "@wearly/ui-native/card";
import { Media } from "@wearly/ui-native/media";
import { AnimatedPressable, usePressScale } from "@wearly/ui-native/motion";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * The lead story, and the note beneath it.
 *
 * The current Home opens with a product card and a price on it. This is the
 * opposite bet: the opening spread is an article about a garment — subject,
 * standfirst, byline, and the money demoted to a footnote at the end, the way a
 * broadsheet does it. The garment is still why someone arrived, but it is not
 * what the screen is.
 *
 * No copy is invented here. The subject is the piece, the standfirst is the
 * piece's own description and the byline is the real lender, so the editorial
 * voice comes from the layout rather than from text that claims things the
 * prototype cannot support.
 *
 * It navigates the same way as every other card on the app: straight to the
 * product route, no measured frame. `ProductCard` measures itself so the hero
 * expansion can grow out of the right block, but no screen calls
 * `useOpenProduct` yet, and a second navigation contract here would be a
 * difference from its siblings that buys nothing.
 */

const STORY_DAYS = 4;

export interface LeadStoryProps {
  onPress: () => void;
  piece: Piece;
}

export function LeadStory({ onPress, piece }: LeadStoryProps) {
  const { animatedStyle, onPressIn, onPressOut } = usePressScale(0.985);

  return (
    <AnimatedPressable
      accessibilityLabel={`Read the story: ${piece.name}, lent by ${piece.lender.name}`}
      accessibilityRole="button"
      className="overflow-hidden rounded-card border border-border bg-card active:bg-muted"
      onPress={onPress}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      style={animatedStyle}
    >
      <Media
        aspect="3/4"
        icon="sparkles"
        src={piece.images[0]}
        tone={piece.gallery[0]}
      />

      <View className="gap-3 p-5">
        <Badge variant="neutral">{piece.category}</Badge>

        <Text variant="headingLg">{piece.name}</Text>

        <Text tone="muted-foreground" variant="bodySm">
          {piece.description}
        </Text>

        <View className="flex-row items-center gap-3 border-border border-t pt-3">
          <Text className="flex-1" variant="caption">
            {`Lent by ${piece.lender.name} · ${piece.lender.neighbourhood}`}
          </Text>
          <Text tone="muted-foreground" variant="caption">
            {rentalSummary(piece, STORY_DAYS)}
          </Text>
        </View>
      </View>
    </AnimatedPressable>
  );
}

/**
 * The person, as content.
 *
 * Wearly is peer-to-peer, so the lender is not metadata on a listing — they are
 * the other half of the transaction. The prototype cannot verify anyone, and the
 * copy says so rather than showing a tick that would mean nothing.
 */
export function LenderNote({ piece }: { piece: Piece }) {
  return (
    <Card className="gap-3 p-5" variant="muted">
      <Badge variant="info">About the lender</Badge>

      <Text variant="headingSm">{piece.lender.name}</Text>

      <Text tone="muted-foreground" variant="bodySm">
        {`Lends from ${piece.lender.neighbourhood}. Nobody here has been checked against a real person yet, and the deposit is a number on a screen rather than money anyone has moved.`}
      </Text>

      <Text tone="muted-foreground" variant="caption">
        {`${sizeOf(piece)} · ${CONDITION_LABEL[piece.condition]} · ₹${piece.deposit} refundable`}
      </Text>
    </Card>
  );
}
