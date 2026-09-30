import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { AuthSheet } from "@features/auth/components/auth-sheet";
import { useRentalDraft } from "@features/rental/providers/rental-draft-provider";
import type { Fulfillment } from "@features/rental/validations/rental.schema";
import { countDays } from "@features/rental/validations/rental.schema";
import { findPiece, formatRupees } from "@shared/data/catalogue";
import { Chip } from "@wearly/ui-native/badge";
import { Button, IconButton } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Media } from "@wearly/ui-native/media";
import { PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { useMemo, useState } from "react";
import { ScrollView, View } from "react-native";

/**
 * Checkout.
 *
 * The screen where Wearly has to earn its trust, so it does the least impressive
 * thing available: shows every number, adds nothing at the end, and says so in
 * writing. The total is the last line, not a surprise one screen later.
 *
 * Fees are real lines with real names — cleaning and delivery are named, and
 * neither appears after this screen. The one thing a rental marketplace gets
 * wrong most often is a "platform fee" that materialises on the last step, and
 * the fastest way to be trusted is to never do that.
 *
 * Signing in is asked for here, at the moment it is genuinely needed, and only
 * because the next step is a payment. The sheet explains that before it asks for
 * anything.
 */

const DELIVERY_FEE = 79;
const CLEANING_FEE_PER_DAY = 25;

/**
 * The checkout never shows a total until delivery or pickup has been chosen.
 * A default would be a guess the user never made, and the whole point of this
 * screen is that nothing is assumed on their behalf.
 */
function ctaLabel(
  method: Fulfillment | null,
  isAuthenticated: boolean,
  total: number
): string {
  if (method === null) {
    return "Choose delivery or pickup";
  }
  return isAuthenticated ? `Pay ${formatRupees(total)}` : "Continue to payment";
}

export default function CheckoutScreen() {
  const router = useRouter();
  const { draft, set } = useRentalDraft();
  const { dispatch, state } = useSession();
  const toast = useToast();
  const [showAuth, setShowAuth] = useState(false);

  const piece = findPiece(draft.pieceId ?? "");

  const totals = useMemo(() => {
    if (!(piece && draft.start && draft.end)) {
      return null;
    }
    const days = countDays(draft.start, draft.end);
    const rental = piece.dailyRate * days;
    const cleaning = CLEANING_FEE_PER_DAY * days;
    const delivery = draft.method === "delivery" ? DELIVERY_FEE : 0;

    return {
      cleaning,
      days,
      delivery,
      deposit: piece.deposit,
      rental,
      total: rental + cleaning + delivery,
    };
  }, [draft.end, draft.method, draft.start, piece]);

  if (!(piece && totals)) {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-background px-page-inline">
        <Text className="text-center" variant="headingMd">
          There is nothing to check out yet
        </Text>
        <Button onPress={() => router.replace(ROUTES.discover)}>
          Find something to rent
        </Button>
      </View>
    );
  }

  const confirm = () => {
    if (draft.method === null) {
      toast.show("Choose delivery or pickup first", "error");
      return;
    }
    if (state.isAuthenticated) {
      router.replace(ROUTES.confirmed);
      return;
    }
    setShowAuth(true);
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <ScrollView
        className="flex flex-col"
        contentContainerClassName="flex flex-col gap-8 pb-8"
      >
        <View className="flex-row items-center justify-between px-page-inline pt-4">
          <IconButton
            accessibilityLabel="Go back"
            icon="arrow-left"
            onPress={() => router.back()}
          />
          <Text variant="headingSm">Review</Text>
          <View className="size-11" />
        </View>

        <Card className="mx-page-inline flex-row items-center gap-4 p-4">
          <View className="w-20 overflow-hidden rounded-media">
            <Media aspect="1/1" src={piece.images[0]} tone={piece.gallery[0]} />
          </View>
          <View className="flex-1 gap-1">
            <Text numberOfLines={2} variant="bodyMd">
              {piece.name}
            </Text>
            <Text tone="muted-foreground" variant="caption">
              {`${draft.start} → ${draft.end} · ${totals.days} ${totals.days === 1 ? "day" : "days"}`}
            </Text>
          </View>
        </Card>

        <View className="px-page-inline">
          <Panel subtitle="Shown now, charged now" title="How you get it">
            <View className="flex-row flex-wrap gap-3 pt-1">
              <Chip
                onPress={() => set({ method: "delivery" })}
                selected={draft.method === "delivery"}
              >
                {`Delivery · ${formatRupees(DELIVERY_FEE)}`}
              </Chip>
              <Chip
                onPress={() => set({ method: "pickup" })}
                selected={draft.method === "pickup"}
              >
                Pickup · free
              </Chip>
            </View>
            {draft.method === null ? (
              <Text tone="muted-foreground" variant="caption">
                Choose one to see the final total. Nothing is charged either way
                in this prototype.
              </Text>
            ) : null}
          </Panel>
        </View>

        <View className="px-page-inline">
          <Panel title="What you are paying">
            <View className="flex-col gap-3">
              <PriceRow
                hint={`${totals.days} × ${formatRupees(piece.dailyRate)}`}
                label="Rental"
                value={formatRupees(totals.rental)}
              />
              <PriceRow
                hint="Included in the price"
                label="Dry cleaning"
                value={formatRupees(totals.cleaning)}
              />
              <PriceRow
                emphasis={totals.delivery === 0 ? "muted" : "normal"}
                label={totals.delivery === 0 ? "Pickup" : "Delivery"}
                value={
                  totals.delivery === 0 ? "Free" : formatRupees(totals.delivery)
                }
              />
              <PriceRow
                emphasis="total"
                label="Total today"
                value={formatRupees(totals.total)}
              />
              <PriceRow
                emphasis="muted"
                hint="Returned to you after the piece comes back"
                label="Deposit"
                value={formatRupees(totals.deposit)}
              />
            </View>
          </Panel>
        </View>

        <View className="mx-page-inline flex-row items-start gap-3 rounded-card bg-accent p-5">
          <Icon name="shield" size="sm" tone="accent-foreground" />
          <Text className="flex-1" tone="accent-foreground" variant="bodySm">
            That is the whole cost. Nothing else is added on the next screen.
          </Text>
        </View>
      </ScrollView>

      <View className="gap-3 border-border border-t bg-card px-page-inline pt-5 pb-10">
        <Text tone="muted-foreground" variant="caption">
          {state.isAuthenticated
            ? `Paying as ${state.name ?? "your account"}. Nothing else is added.`
            : "The next step is a payment, which is the first thing Wearly needs an account for."}
        </Text>
        <Button disabled={draft.method === null} onPress={confirm} size="lg">
          {ctaLabel(draft.method, state.isAuthenticated, totals.total)}
        </Button>
      </View>

      <AuthSheet
        onClose={() => setShowAuth(false)}
        onSignedIn={(name) => {
          dispatch({ name, type: "sign-in" });
          setShowAuth(false);
        }}
        open={showAuth}
        reason="You are one step from paying for this rental. An account is how we hold your booking, your deposit and your refund together."
      />
    </View>
  );
}
