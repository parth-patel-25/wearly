import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { useRentalDraft } from "@features/rental/providers/rental-draft-provider";
import { countDays } from "@features/rental/validations/rental.schema";
import type { Piece } from "@shared/data/catalogue";
import { findPiece, formatRupees } from "@shared/data/catalogue";
import { Button } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Media } from "@wearly/ui-native/media";
import { useFadeIn } from "@wearly/ui-native/motion";
import { PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { View } from "react-native";
import Animated from "react-native-reanimated";

/**
 * Rental confirmed.
 *
 * The one moment where a little ceremony is correct. The check mark draws itself,
 * the details arrive a beat later, and the two things a renter actually needs
 * next — the dates and the lender — are the two biggest things on the screen.
 *
 * The booking is committed to the session here rather than on the previous
 * screen, so a user who somehow reaches this screen without one cannot end up
 * with a confirmation for a rental that was never made.
 */

const CLEANING_FEE_PER_DAY = 25;
const DELIVERY_FEE = 79;

export default function ConfirmedScreen() {
  const { draft } = useRentalDraft();
  const piece = findPiece(draft.pieceId ?? "");

  const isComplete = Boolean(piece && draft.start && draft.end);

  return isComplete ? <ConfirmationBody /> : <NothingToConfirm />;
}

function NothingToConfirm() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-page-inline">
      <Text className="text-center" variant="headingMd">
        There is no rental to confirm
      </Text>
      <Button onPress={() => router.replace(ROUTES.discover)}>
        Find something to rent
      </Button>
    </View>
  );
}

function ConfirmationBody() {
  const router = useRouter();
  const { draft, clear } = useRentalDraft();
  const { dispatch } = useSession();
  const piece = findPiece(draft.pieceId ?? "") as Piece;
  const committed = useRef(false);

  // Commit the booking here rather than on the previous screen, so this screen
  // cannot be reached with a confirmation for a rental that was never made.
  useEffect(() => {
    if (draft.start === null || draft.end === null) {
      return;
    }
    if (committed.current === true) {
      return;
    }
    committed.current = true;
    dispatch({
      rental: {
        end: draft.end,
        method: draft.method,
        pieceId: piece.id,
        start: draft.start,
      },
      type: "rent-confirmed",
    });
  }, [dispatch, draft.end, draft.method, draft.start, piece.id]);

  const days = countDays(draft.start ?? "", draft.end ?? "");
  const rental = piece.dailyRate * days;
  const cleaning = CLEANING_FEE_PER_DAY * days;
  const headlineStyle = useFadeIn();
  const pieceStyle = useFadeIn({ delay: 200, distance: 12 });
  const totalsStyle = useFadeIn({ delay: 320, distance: 12 });
  const noteStyle = useFadeIn({ delay: 440, distance: 12 });

  const delivery = draft.method === "delivery" ? DELIVERY_FEE : 0;
  const total = rental + cleaning + delivery;

  return (
    <View className="flex-1 bg-background">
      <View className="flex-1 gap-10 px-page-inline pt-16 pb-8">
        <Animated.View className="items-center gap-5" style={headlineStyle}>
          <DrawingCheck />
          <View className="items-center gap-2">
            <Text className="text-center" variant="headingXl">
              It is yours for {days} {days === 1 ? "day" : "days"}
            </Text>
            <Text
              className="text-center"
              tone="muted-foreground"
              variant="bodyMd"
            >
              {piece.lender.name} will be in touch about{" "}
              {draft.method === "delivery" ? "delivery" : "pickup"}.
            </Text>
          </View>
        </Animated.View>

        <Animated.View style={pieceStyle}>
          <Card className="flex-row items-center gap-4 p-4">
            <View className="w-20 overflow-hidden rounded-media">
              <Media aspect="1/1" tone={piece.gallery[0]} />
            </View>
            <View className="flex-1 gap-1">
              <Text numberOfLines={2} variant="bodyMd">
                {piece.name}
              </Text>
              <Text tone="muted-foreground" variant="caption">
                {`${draft.start} → ${draft.end}`}
              </Text>
            </View>
          </Card>
        </Animated.View>

        <Animated.View style={totalsStyle}>
          <Panel title="Paid today">
            <View className="flex-col gap-3">
              <PriceRow label="Rental" value={formatRupees(rental)} />
              <PriceRow label="Dry cleaning" value={formatRupees(cleaning)} />
              <PriceRow
                emphasis={delivery === 0 ? "muted" : "normal"}
                label={delivery === 0 ? "Pickup" : "Delivery"}
                value={delivery === 0 ? "Free" : formatRupees(delivery)}
              />
              <PriceRow
                emphasis="total"
                label="Total"
                value={formatRupees(total)}
              />
              <PriceRow
                emphasis="muted"
                hint="Refunded once it comes back"
                label="Deposit held"
                value={formatRupees(piece.deposit)}
              />
            </View>
          </Panel>
        </Animated.View>

        <Animated.View style={noteStyle}>
          <View className="flex-row items-start gap-3 rounded-card bg-muted p-5">
            <Icon name="sparkles" size="sm" tone="muted-foreground" />
            <Text className="flex-1" tone="muted-foreground" variant="bodySm">
              This is a prototype. No payment was taken, no message was sent,
              and the piece does not exist.
            </Text>
          </View>
        </Animated.View>
      </View>

      <View className="gap-3 border-border border-t bg-card px-page-inline pt-5 pb-10">
        <Button
          onPress={() => {
            clear();
            router.replace(ROUTES.rentals);
          }}
          size="lg"
        >
          See my rentals
        </Button>
        <Button
          onPress={() => {
            clear();
            router.replace(ROUTES.home);
          }}
          size="sm"
          variant="ghost"
        >
          Keep browsing
        </Button>
      </View>
    </View>
  );
}

/** The one animated moment in the app, and it is 400ms. */
function DrawingCheck() {
  return (
    <View className="size-16 items-center justify-center rounded-pill bg-success-background">
      <Icon name="check" size="lg" tone="success" />
    </View>
  );
}
