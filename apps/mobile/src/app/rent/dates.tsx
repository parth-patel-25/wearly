import { ROUTES } from "@core/routing/routes";
import { useRentalDraft } from "@features/rental/providers/rental-draft-provider";
import { countDays } from "@features/rental/validations/rental.schema";
import type { Piece } from "@shared/data/catalogue";
import {
  findPiece,
  formatRupees,
  rentalSummary,
  sizeOf,
} from "@shared/data/catalogue";
import { Badge } from "@wearly/ui-native/badge";
import { Button, IconButton } from "@wearly/ui-native/button";
import type { CalendarRange } from "@wearly/ui-native/calendar";
import { Calendar } from "@wearly/ui-native/calendar";
import { Card } from "@wearly/ui-native/card";
import { PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { View } from "react-native";

/**
 * Date selection.
 *
 * A core Wearly interaction, so the three things it must make obvious are the
 * chosen start, the chosen return, and what they cost. The running summary at
 * the bottom is not decoration — it is how someone avoids doing the arithmetic
 * in their head before they reach checkout and find a different number.
 *
 * Unavailable days come from the piece itself, so the calendar genuinely refuses
 * them instead of pretending to be generic.
 *
 * The screen splits into a route component and a body component so the body can
 * return early for a missing piece without any hook ending up below a return.
 */

const TODAY = new Date().toISOString().slice(0, 10);

export default function DatesScreen() {
  const { pieceId } = useLocalSearchParams<{ pieceId: string }>();
  const { draft } = useRentalDraft();
  const piece = findPiece(
    typeof pieceId === "string" ? pieceId : (draft.pieceId ?? "")
  );

  return piece === undefined ? <MissingPiece /> : <DatesBody piece={piece} />;
}

function MissingPiece() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-page-inline">
      <Text className="text-center" variant="headingMd">
        We lost track of which piece this is
      </Text>
      <Button onPress={() => router.replace(ROUTES.discover)}>
        Back to Discover
      </Button>
    </View>
  );
}

interface DatesBodyProps {
  piece: Piece;
}

function DatesBody({ piece }: DatesBodyProps) {
  const router = useRouter();
  const toast = useToast();
  const { draft, set } = useRentalDraft();
  const [error, setError] = useState<string | null>(null);

  const days =
    draft.start && draft.end ? countDays(draft.start, draft.end) : null;
  const range: CalendarRange = {
    end: draft.end,
    start: draft.start ?? piece.availableFrom,
  };

  // The calendar pre-selects the lender's earliest start. Write that into the
  // draft as well, so what the calendar shows and what the flow has recorded can
  // never disagree about what the user picked.
  useEffect(() => {
    if (draft.start === null) {
      set({ start: piece.availableFrom });
    }
  }, [draft.start, piece.availableFrom, set]);

  const continueToCheckout = () => {
    if (draft.start === null) {
      setError("Pick the day you want it from");
      toast.show("Pick the day you want it from", "error");
      return;
    }
    if (draft.end === null) {
      setError("Now pick the day it comes back");
      toast.show("Now pick the day it comes back", "error");
      return;
    }
    setError(null);
    set({ pieceId: piece.id });
    router.push(ROUTES.checkout);
  };

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 gap-8 px-page-inline pt-4">
        <View className="flex-row items-center justify-between">
          <IconButton
            accessibilityLabel="Go back"
            icon="arrow-left"
            onPress={() => router.back()}
          />
          <Badge variant="primary">{`Size ${sizeOf(piece)}`}</Badge>
        </View>

        <View className="gap-1">
          <Text variant="headingXl">When do you need it?</Text>
          <Text tone="muted-foreground" variant="bodyMd">
            {piece.name}
          </Text>
        </View>

        <Calendar
          blocked={piece.unavailable}
          minDate={TODAY}
          onChange={(next: CalendarRange) => {
            setError(null);
            set({ end: next.end, start: next.start });
          }}
          range={range}
        />

        {error === null ? null : (
          <Text accessibilityRole="alert" tone="destructive" variant="bodySm">
            {error}
          </Text>
        )}
      </View>

      <View className="gap-4 border-border border-t bg-card px-page-inline pt-5 pb-10">
        <Card className="gap-2 p-5">
          <PriceRow
            hint={
              days === null
                ? "Choose your dates"
                : `${days} ${days === 1 ? "day" : "days"} at ${formatRupees(piece.dailyRate)}`
            }
            label="Rental"
            value={days === null ? "—" : rentalSummary(piece, days)}
          />
          <PriceRow
            emphasis="muted"
            label="Refundable deposit"
            value={formatRupees(piece.deposit)}
          />
        </Card>

        <Button disabled={days === null} onPress={continueToCheckout} size="lg">
          {days === null ? "Pick your dates" : "Review and continue"}
        </Button>
      </View>
    </View>
  );
}
