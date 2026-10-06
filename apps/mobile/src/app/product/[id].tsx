import { useSession } from "@core/providers/session-provider";
import { datesFor, ROUTES } from "@core/routing/routes";
import type { Piece } from "@shared/data/catalogue";
import {
  CONDITION_LABEL,
  findPiece,
  formatRupees,
  rentalSummary,
  sizeOf,
} from "@shared/data/catalogue";
import { Avatar } from "@wearly/ui-native/avatar";
import { Badge } from "@wearly/ui-native/badge";
import { Button, IconButton } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { ProgressBar } from "@wearly/ui-native/display";
import type { IconName } from "@wearly/ui-native/icon";
import { Icon } from "@wearly/ui-native/icon";
import { Media } from "@wearly/ui-native/media";
import { KeyValueRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, View } from "react-native";

/**
 * Product detail.
 *
 * The most important screen, and the one that most needs progressive disclosure.
 * The top is image and price. Everything a renter needs in order to decide — fit,
 * condition, dates, owner, policies — is a labelled section below, and none of
 * it competes with the imagery.
 *
 * `Rent this` is sticky. The alternative is a user who has scrolled past the
 * price and has to scroll back to find out what it costs.
 *
 * There is no Reviews content. The product spec forbids inventing social proof,
 * and three fabricated five-star entries under a "Reviews" heading would be
 * exactly that, so the section exists and is honestly empty.
 */

const RENTAL_DAYS = 3;

export default function ProductScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const piece = typeof id === "string" ? findPiece(id) : undefined;

  if (!piece) {
    return <MissingProduct />;
  }

  return <ProductDetail piece={piece} />;
}

interface ProductDetailProps {
  piece: Piece;
}

function ProductDetail({ piece }: ProductDetailProps) {
  const router = useRouter();
  const { dispatch, state } = useSession();

  const isSaved = state.favourites.includes(piece.id);
  const size = sizeOf(piece);
  const summary = rentalSummary(piece, RENTAL_DAYS);

  return (
    // `pt-safe` is the status-bar inset; the header row's own `pt-4` is the gap
    // below it. Splitting the two is what stops the back button from sitting
    // under the notch on a device that has one.
    <View className="flex-1 bg-background pt-safe">
      <ScrollView
        className="flex flex-col"
        contentContainerClassName="flex flex-col pb-44"
        showsVerticalScrollIndicator={false}
      >
        {/* `z-10` keeps the header above the image that follows it: the image
            is pulled up by the header's exact height (`-mt-16` = size-12
            button + pt-4) so the header floats over the hero without any
            absolute positioning. */}
        <View className="z-10 flex-row items-center justify-between px-gutter pt-4">
          <IconButton
            accessibilityLabel="Go back"
            icon="arrow-left"
            onPress={() => router.back()}
          />
          <Text className="flex-1 text-center" variant="headingMd">
            Product Details
          </Text>
          <IconButton
            accessibilityLabel={
              isSaved ? "Remove from saved" : "Save this piece"
            }
            icon={isSaved ? "heart-filled" : "heart"}
            onPress={() =>
              dispatch({ pieceId: piece.id, type: "toggle-favourite" })
            }
            tone="primary"
            variant="soft"
          />
        </View>

        <Media
          aspect="3/4"
          className="-mt-16"
          src={piece.images[0]}
          tone={piece.gallery[0]}
        />

        {/* The content sheet overlaps the image's bottom edge (`-mt-8`) and
            carries the Home content sheet's top corner radius. */}
        <View className="-mt-8 flex flex-col gap-10 rounded-t-5xl bg-background pt-8">
          <View className="gap-2 px-gutter">
            <Text variant="headingXl">{piece.name}</Text>
            <Text variant="price">{`${formatRupees(piece.dailyRate)} / day`}</Text>
            <Text tone="muted-foreground" variant="bodySm">
              {`${summary} · ${formatRupees(piece.deposit)} refundable deposit`}
            </Text>
          </View>

          <View className="flex-row flex-wrap gap-2 px-gutter">
            <Badge variant="primary">{CONDITION_LABEL[piece.condition]}</Badge>
            <Badge>{`Size ${size}`}</Badge>
            <Badge variant="success">Available now</Badge>
          </View>

          <Section title="About this piece">
            <Text tone="muted-foreground" variant="bodyMd">
              {piece.description}
            </Text>
          </Section>

          <Section subtitle="Known before you book" title="Fit and condition">
            <KeyValueRow label="Size" value={size} />
            <KeyValueRow
              label="Condition"
              value={CONDITION_LABEL[piece.condition]}
            />
            <KeyValueRow label="Care" value="Dry clean only" />
          </Section>

          <Section subtitle="You pick the dates next" title="Availability">
            <KeyValueRow label="Earliest start" value={piece.availableFrom} />
            <KeyValueRow
              label="Already committed"
              value={`${piece.unavailable.length} days this month`}
            />
            <View className="flex-row flex-wrap gap-2 pt-3">
              {piece.unavailable.map((day) => (
                <Badge key={day} variant="warning">
                  {day}
                </Badge>
              ))}
            </View>
          </Section>

          <Section title="Who you are renting from">
            <Card className="flex-row items-center gap-4 p-5">
              <Avatar name={piece.lender.name} size="lg" />
              <View className="flex-1 gap-1">
                <Text variant="bodyMd">{piece.lender.name}</Text>
                <View className="flex-row items-center gap-1">
                  <Icon name="map-pin" size="xs" tone="muted-foreground" />
                  <Text tone="muted-foreground" variant="caption">
                    {piece.lender.neighbourhood}
                  </Text>
                </View>
              </View>
              {piece.lender.verified ? (
                <Badge variant="success">ID verified</Badge>
              ) : (
                <Badge>Not verified</Badge>
              )}
            </Card>
          </Section>

          <Section title="Good to know">
            <Policy
              icon="truck"
              text="Delivery or pickup, your choice. Chosen before you pay."
            />
            <Policy
              icon="lock"
              text={`${formatRupees(piece.deposit)} deposit, released once it comes back.`}
            />
            <Policy
              icon="sparkles"
              text="Dry clean only. The cleaning cost is in the price above."
            />
          </Section>

          <Section title="Reviews">
            <View className="flex-row items-center gap-4 rounded-card bg-muted p-5">
              <View className="size-11 items-center justify-center rounded-pill bg-card">
                <Icon name="sparkles" size="sm" tone="muted-foreground" />
              </View>
              <View className="flex-1 gap-1">
                <Text variant="bodySm">Not reviewed yet</Text>
                <Text tone="muted-foreground" variant="caption">
                  This prototype has no real renters, so there is nothing honest
                  to show here.
                </Text>
              </View>
            </View>
          </Section>

          <Section title="About Wearly">
            <View className="gap-3">
              <ProgressBar label="Your Wearly profile" value={10} />
              <Text tone="muted-foreground" variant="caption">
                Browsing never needs an account. You will only be asked when you
                rent, save or list.
              </Text>
            </View>
          </Section>
        </View>
      </ScrollView>

      <StickyCta pieceId={piece.id} summary={summary} />
    </View>
  );
}

interface SectionProps {
  children: React.ReactNode;
  subtitle?: string;
  title: string;
}

function Section({ children, subtitle, title }: SectionProps) {
  return (
    <View className="px-gutter">
      <Panel subtitle={subtitle} title={title}>
        {children}
      </Panel>
    </View>
  );
}

interface PolicyProps {
  icon: Extract<IconName, "lock" | "sparkles" | "truck">;
  text: string;
}

function Policy({ icon, text }: PolicyProps) {
  return (
    <View className="flex-row items-start gap-3 py-2">
      <View className="size-9 items-center justify-center rounded-pill bg-accent">
        <Icon name={icon} size="sm" tone="accent-foreground" />
      </View>
      <Text className="flex-1" tone="muted-foreground" variant="bodySm">
        {text}
      </Text>
    </View>
  );
}

interface StickyCtaProps {
  pieceId: string;
  summary: string;
}

function StickyCta({ pieceId, summary }: StickyCtaProps) {
  const router = useRouter();

  return (
    <View className="absolute inset-x-0 bottom-0 flex-row items-center gap-4 border-border border-t bg-card px-gutter pt-4 pb-10">
      <View className="flex-1 gap-0.5">
        <Text variant="price">{summary}</Text>
        <Text tone="muted-foreground" variant="caption">
          Deposit refunded on return
        </Text>
      </View>
      <View className="min-w-40">
        <Button onPress={() => router.push(datesFor(pieceId))} size="lg">
          Rent this
        </Button>
      </View>
    </View>
  );
}

function MissingProduct() {
  const router = useRouter();
  return (
    <View className="flex-1 items-center justify-center gap-6 bg-background px-gutter">
      <Text className="text-center" variant="headingMd">
        We could not find that piece
      </Text>
      <Button onPress={() => router.replace(ROUTES.discover)}>
        Back to Discover
      </Button>
    </View>
  );
}
