import { useSession } from "@core/providers/session-provider";
import { confirmedFor, ROUTES } from "@core/routing/routes";
import { useRentalDraft } from "@features/rental/providers/rental-draft-provider";
import { rentalApi } from "@features/rental/services/rental-api";
import { formatRupees } from "@shared/data/catalogue";
import { listingToPiece } from "@shared/data/listing-to-piece";
import { formatDate } from "@shared/lib/format-date";
import { useMutation, useQuery } from "@tanstack/react-query";
import { API_ROUTES } from "@wearly/shared/api/routes";
import { FULFILLMENT_METHODS } from "@wearly/shared/enums";
import { quoteRental } from "@wearly/shared/rentals/pricing";
import { Button, IconButton } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Media } from "@wearly/ui-native/media";
import { PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useRouter } from "expo-router";
import { useState } from "react";
import { ScrollView, View } from "react-native";

const apiBase = process.env.EXPO_PUBLIC_API_URL ?? "http://localhost:4000";

/**
 * Review request — replaces the delivery checkout.
 *
 * Every number is shown before anything is sent, and the table has no delivery
 * line and no deposit. The payment block is explicit that no provider is
 * connected: nothing is authorized, reserved or charged by sending this.
 */
export default function ReviewRequestScreen() {
  const router = useRouter();
  const toast = useToast();
  const { state } = useSession();
  const { draft, clear } = useRentalDraft();
  const [error, setError] = useState("");

  const { data: listing } = useQuery({
    enabled: Boolean(draft.pieceId),
    queryFn: async () => {
      const response = await fetch(
        `${apiBase}${API_ROUTES.LISTINGS.BY_ID(draft.pieceId ?? "")}`
      );
      if (!response.ok) {
        return null;
      }
      return (await response.json()) as import("@wearly/shared/api/types").Listing;
    },
    queryKey: ["listing", draft.pieceId],
  });

  const piece = listing ? listingToPiece(listing) : undefined;
  const quote =
    draft.start && draft.end && listing
      ? quoteRental({
          endDate: draft.end,
          pricePerDay: listing.pricePerDay,
          startDate: draft.start,
        })
      : null;

  const create = useMutation({
    mutationFn: () =>
      rentalApi.create({
        endDate: draft.end ?? "",
        fulfillmentMethod: FULFILLMENT_METHODS.IN_PERSON,
        listingId: draft.pieceId ?? "",
        startDate: draft.start ?? "",
      }),
    onError: (cause) => {
      const message =
        cause instanceof Error ? cause.message : "Could not send the request.";
      setError(message);
      toast.show(message, "error");
    },
    onSuccess: (rental) => {
      clear();
      router.replace(confirmedFor(rental.id));
    },
  });

  if (!(piece && quote && draft.start && draft.end)) {
    return (
      <View className="flex-1 items-center justify-center gap-6 bg-background px-gutter">
        <Text className="text-center" variant="headingMd">
          There is nothing to review yet
        </Text>
        <Button onPress={() => router.replace(ROUTES.discover)}>
          Find something to rent
        </Button>
      </View>
    );
  }

  const send = () => {
    if (!state.isAuthenticated) {
      router.push(ROUTES.signIn);
      return;
    }
    setError("");
    create.mutate();
  };

  return (
    <View className="flex-1 bg-background pt-safe">
      <View className="flex-row items-center px-gutter pt-4 pb-4">
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={() => router.back()}
          variant="outline"
        />
        <View className="flex-1 items-center">
          <Text numberOfLines={1} variant="headingSm">
            Review request
          </Text>
        </View>
        <View aria-hidden className="size-12" />
      </View>

      <ScrollView
        contentContainerClassName="gap-8 px-gutter pb-8"
        showsVerticalScrollIndicator={false}
      >
        <Card className="flex-row items-center gap-4 p-4">
          <View className="w-20 overflow-hidden rounded-media">
            <Media aspect="1/1" src={piece.images[0]} tone={piece.gallery[0]} />
          </View>
          <View className="flex-1 gap-1">
            <Text numberOfLines={2} variant="bodyMd">
              {piece.name}
            </Text>
            <Text tone="muted-foreground" variant="caption">
              {`${formatDate(draft.start)} → ${formatDate(draft.end)} · ${quote.days} ${quote.days === 1 ? "day" : "days"}`}
            </Text>
          </View>
        </Card>

        <Panel
          subtitle="A public place, agreed with the lender"
          title="How you get it"
        >
          <View className="flex-row items-start gap-3 rounded-card bg-accent p-4">
            <Icon name="map-pin" size="sm" tone="accent-foreground" />
            <Text className="flex-1" tone="accent-foreground" variant="bodySm">
              Wearly never shares an exact address. You and the lender agree on
              a café, mall or station after they accept.
            </Text>
          </View>
        </Panel>

        <Panel title="What you are agreeing to">
          <View className="flex-col gap-3">
            <PriceRow
              hint={`${quote.days} × ${formatRupees(quote.pricePerDayRupees)}`}
              label="Rental"
              value={formatRupees(quote.rentalAmountRupees)}
            />
            <PriceRow
              hint="Included in the price"
              label="Cleaning"
              value={formatRupees(quote.cleaningFeeRupees)}
            />
            <PriceRow
              emphasis="total"
              label="Total"
              value={formatRupees(quote.totalRupees)}
            />
          </View>
          <Text tone="muted-foreground" variant="caption">
            No deposit and no delivery fee. The lender has 48 hours to respond;
            nothing is charged if they decline or the request expires.
          </Text>
        </Panel>

        <Card className="flex-row items-start gap-3 p-5" variant="muted">
          <Icon name="shield" size="sm" tone="muted-foreground" />
          <Text className="flex-1" tone="muted-foreground" variant="bodySm">
            Payment protection is not connected in this build. No money has been
            taken or reserved. Sending this only asks the lender.
          </Text>
        </Card>

        {error.length > 0 ? (
          <Text accessibilityRole="alert" tone="destructive" variant="bodySm">
            {error}
          </Text>
        ) : null}
      </ScrollView>

      <View className="gap-3 border-border border-t bg-card px-gutter pt-5 pb-10">
        <Text tone="muted-foreground" variant="caption">
          {state.isAuthenticated
            ? `Requesting as ${state.name ?? "your account"}.`
            : "The next step is signing in, so the lender knows who is asking."}
        </Text>
        <Button disabled={create.isPending} onPress={send} size="lg">
          {submitLabelFor(create.isPending, state.isAuthenticated)}
        </Button>
      </View>
    </View>
  );
}

function submitLabelFor(isPending: boolean, isAuthenticated: boolean): string {
  if (isPending) {
    return "Sending request…";
  }
  return isAuthenticated ? "Send rental request" : "Continue to sign in";
}
