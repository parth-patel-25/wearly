import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * The masthead.
 *
 * A magazine names itself before it shows you anything, and the name is a claim
 * about taste rather than a label for a feature. So this is a display line, a
 * dateline and a running line — the three things a broadsheet puts above its
 * first story, and none of the three is a price.
 *
 * The dateline counts what is actually in the catalogue rather than implying a
 * live inventory the prototype does not have.
 */

export interface EditorialMastheadProps {
  /** The reader's first name, when there is one. */
  firstName?: string;
  /** Honest count of what is actually on the rail. */
  pieceCount: number;
}

export function EditorialMasthead({
  firstName,
  pieceCount,
}: EditorialMastheadProps) {
  return (
    <View className="gap-4 pt-8">
      <Text variant="display">{"The borrowed\nissue."}</Text>

      <View className="flex-row flex-wrap items-center gap-x-3 border-border border-t pt-3">
        <Text tone="muted-foreground" variant="label">
          {firstName ? `For ${firstName}` : "For you"}
        </Text>
        <Dot />
        <Text tone="muted-foreground" variant="label">
          {`${pieceCount} pieces on the rail`}
        </Text>
        <Dot />
        <Text tone="muted-foreground" variant="label">
          Read, then borrow
        </Text>
      </View>
    </View>
  );
}

function Dot() {
  return (
    <Text tone="brand" variant="label">
      {"·"}
    </Text>
  );
}
