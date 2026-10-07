import { useSession } from "@core/providers/session-provider";
import { datesFor, ROUTES } from "@core/routing/routes";
import { useHeroParallax } from "@features/product/hooks/use-hero-parallax";
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
import { View } from "react-native";
import Animated from "react-native-reanimated";

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
  const parallax = useHeroParallax();

  return (
    // The status strip is its own opaque backdrop (inset height only): the
    // parallax photo drifts up underneath it instead of showing through the
    // status bar. `bg-background` at rest, `bg-card` once the header turns
    // solid, so the two always read as one bar. The header row's own `pt-4`
    // is the gap below the inset, which keeps the back button clear of the
    // notch on a device that has one.
    <View className="flex-1 bg-background">
      <View
        className={
          parallax.headerSolid
            ? "z-10 bg-card pt-safe"
            : "z-10 bg-background pt-safe"
        }
      />
      {/* Fixed header: a flex sibling above the scroller (`z-10`), so it stays
          put while photo and sheet move underneath it. Transparent while
          floating over the hero, solid `bg-card` once scrolled — the border
          slot is always rendered so the switch never re-lays-out. Symmetric
          `pt-4`/`pb-4` around the `size-12` buttons so the hairline never
          touches the icons. The title starts empty and takes over the piece
          name once the in-content title has scrolled past it. The photo is
          pulled up by the header's exact height (`-mt-20` = buttons +
          `pt-4` + `pb-4`) without any absolute positioning. */}
      <View
        className={
          parallax.headerSolid
            ? "z-10 flex-row items-center justify-between border-border border-b bg-card px-gutter pt-4 pb-4"
            : "z-10 flex-row items-center justify-between border-transparent border-b bg-transparent px-gutter pt-4 pb-4"
        }
        onLayout={parallax.onCrossingLayout}
        ref={parallax.headerRef}
      >
        <IconButton
          accessibilityLabel="Go back"
          icon="arrow-left"
          onPress={() => router.back()}
          variant="outline"
        />
        <Text
          className="flex-1 text-center"
          numberOfLines={1}
          variant="headingMd"
        >
          {parallax.titleHidden ? piece.name : null}
        </Text>
        <IconButton
          accessibilityLabel={isSaved ? "Remove from saved" : "Save this piece"}
          icon={isSaved ? "heart-filled" : "heart"}
          onPress={() =>
            dispatch({ pieceId: piece.id, type: "toggle-favourite" })
          }
          tone="primary"
          variant="soft"
        />
      </View>

      {/* Parallax hero: fixed outside the scroller and drifting up slower than
          the sheet (see `useHeroParallax`) instead of scrolling with it. */}
      <Animated.View
        className="-mt-20"
        onLayout={parallax.onPhotoLayout}
        style={parallax.photoStyle}
      >
        <Media aspect="3/4" src={piece.images[0]} tone="secondary" />
      </Animated.View>

      <Animated.ScrollView
        className="flex flex-1 flex-col bg-transparent"
        // Transparent: the photo shows through the spacer until the sheet
        // slides up to cover it. Bottom breathing room lives inside the
        // sheet (`pb-8`) so it meets the footer bar with only the bar's
        // hairline between them.
        contentContainerClassName="flex flex-col bg-transparent"
        onScroll={parallax.onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        style={{ marginTop: parallax.scrollerMarginTop }}
      >
        <View
          className="w-full bg-transparent"
          style={{ height: parallax.spacerHeight }}
        />

        {/* The content sheet rests over the photo's bottom edge (`SHEET_PEEK`
            in `useHeroParallax`) so the rounded top corners read clearly
            against the photograph. Pure
            `bg-card` white, same as the Home sheet, at one radius step larger
            (`rounded-t-6xl`), plus `shadow-lift` — one step above the sheet
            elevation — so the white lifts off light imagery instead of
            blending into it. Rose-tinted, never grey. */}
        <View className="flex flex-col gap-10 rounded-t-6xl bg-card pt-8 pb-8 shadow-lift">
          <View className="gap-2 px-gutter">
            {/* Measured (see `useHeroParallax`): when this title scrolls fully
                past the header, the header takes over showing the piece name. */}
            <View onLayout={parallax.onCrossingLayout} ref={parallax.titleRef}>
              <Text variant="headingXl">{piece.name}</Text>
            </View>
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
            {/* `pb-3` instead of the symmetric `p-5` bottom: the card's own
                padding stacks with the sheet's `gap-10`, which otherwise leaves
                ~60px below this card versus ~48px at every other junction. */}
            <View className="flex-row items-center gap-4 rounded-card bg-muted p-5 pb-3">
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
      </Animated.ScrollView>

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
    <View className="flex-row items-center gap-4 border-border border-t bg-card px-gutter pt-4 pb-10">
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
