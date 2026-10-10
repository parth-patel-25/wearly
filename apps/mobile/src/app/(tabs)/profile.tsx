import { useSession } from "@core/providers/session-provider";
import { ROUTES } from "@core/routing/routes";
import { CATALOGUE } from "@shared/data/catalogue";
import { useCatalogueGrid } from "@shared/hooks/use-catalogue-grid";
import { Avatar } from "@wearly/ui-native/avatar";
import { Badge } from "@wearly/ui-native/badge";
import { Button } from "@wearly/ui-native/button";
import { Card, Panel } from "@wearly/ui-native/card";
import { EmptyState, ProgressBar } from "@wearly/ui-native/display";
import { ProductGrid } from "@wearly/ui-native/product-grid";
import { Text } from "@wearly/ui-native/text";
import { useRouter } from "expo-router";
import { useMemo } from "react";
import { View } from "react-native";

/**
 * Profile.
 *
 * Personal and warm rather than administrative. The progress bar is at the top
 * on purpose: the psychological job is "I've already started", so the very
 * first thing on the screen is evidence that progress exists, not a form.
 *
 * It grows by small, honest steps — a name, a style, one listing — rather than
 * by a long questionnaire. Each completed thing raises it, and the bar always
 * shows the number, because a progress bar you cannot read is not progress.
 */

const STEPS = [
  {
    done: (p: ProfileInput) => p.isAuthenticated,
    label: "Create your account",
  },
  {
    done: (p: ProfileInput) => p.stylingFor !== null,
    label: "Tell us who you are styling",
  },
  { done: (p: ProfileInput) => p.wears !== null, label: "Share what you wear" },
  { done: () => false, label: "List your first piece" },
] as const;

interface ProfileInput {
  isAuthenticated: boolean;
  stylingFor: string | null;
  wears: string | null;
}

export default function ProfileScreen() {
  const router = useRouter();
  const { state } = useSession();
  const saved = useMemo(
    () => CATALOGUE.filter((piece) => state.favourites.includes(piece.id)),
    [state.favourites]
  );
  const { favourites, items, onFavourite } = useCatalogueGrid(saved);

  const input: ProfileInput = {
    isAuthenticated: state.isAuthenticated,
    stylingFor: state.stylingFor,
    wears: state.wears,
  };
  const completed = STEPS.filter((step) => step.done(input)).length;
  const percent = Math.round((completed / STEPS.length) * 100);

  return (
    <View className="flex-1 bg-background">
      <ProductGrid
        className="flex-1 px-3"
        emptyState={
          <EmptyState
            body="Tap the heart on any piece and it will wait for you here."
            icon="heart"
            title="Nothing saved yet"
          />
        }
        favourites={favourites}
        header={<ProfileHeader completed={completed} percent={percent} />}
        items={items}
        onFavourite={onFavourite}
        onOpen={(id) => router.push(ROUTES.product(id))}
      />
    </View>
  );
}

interface ProfileHeaderProps {
  completed: number;
  percent: number;
}

function ProfileHeader({ completed, percent }: ProfileHeaderProps) {
  const router = useRouter();
  const { state } = useSession();
  const nextStep = STEPS.find(
    (step) => !step.done({ ...state, isAuthenticated: state.isAuthenticated })
  );

  return (
    <View className="gap-8 pt-6 pb-2">
      <View className="flex-row items-center gap-4">
        <Avatar name={state.name ?? undefined} size="xl" />
        <View className="flex-1 gap-1">
          <Text variant="headingMd">{state.name ?? "Your Wearly profile"}</Text>
          {state.isAuthenticated ? (
            <Badge variant="success">Account created</Badge>
          ) : (
            <Text tone="muted-foreground" variant="caption">
              Browsing without an account
            </Text>
          )}
        </View>
      </View>

      <Panel
        subtitle="Step by step, whenever you like"
        title="Let's make Wearly yours"
      >
        <View className="gap-4">
          <ProgressBar label="Profile" value={percent} />
          <View className="gap-1">
            {STEPS.map((step) => {
              const isDone = step.done({
                ...state,
                isAuthenticated: state.isAuthenticated,
              });
              return (
                <View
                  className="flex-row items-center gap-3 py-1"
                  key={step.label}
                >
                  <View
                    className={`size-2 rounded-pill ${isDone ? "bg-success" : "bg-border"}`}
                  />
                  <Text
                    tone={isDone ? "foreground" : "muted-foreground"}
                    variant="bodySm"
                  >
                    {step.label}
                  </Text>
                </View>
              );
            })}
          </View>
          {nextStep && percent < 100 ? (
            <Text tone="muted-foreground" variant="caption">
              {completed === 0
                ? "Nothing here is urgent. The only thing an account is needed for is renting, saving and listing."
                : "Nice. We're getting to know your style."}
            </Text>
          ) : null}
        </View>
      </Panel>

      {state.stylingFor || state.wears ? (
        <View className="gap-3">
          <Text variant="headingSm">Your style</Text>
          <View className="flex-row flex-wrap gap-2">
            {state.stylingFor ? (
              <Badge variant="primary">
                {`Styling for ${state.stylingFor}`}
              </Badge>
            ) : null}
            {state.wears ? (
              <Badge variant="primary">{state.wears}</Badge>
            ) : null}
          </View>
        </View>
      ) : null}

      <View className="gap-3">
        <Text variant="headingSm">Saved pieces</Text>
        <Card className="flex-row items-start gap-3 p-5">
          <Text className="flex-1" tone="muted-foreground" variant="bodySm">
            Everything you have saved shows up in the grid below.
          </Text>
        </Card>
      </View>

      <View className="gap-3">
        <Text variant="headingSm">Your listings</Text>
        <Button
          onPress={() => router.push(ROUTES.list)}
          size="md"
          variant="soft"
        >
          List a piece
        </Button>
        <Text tone="muted-foreground" variant="caption">
          The listing flow is the next build phase. This prototype has no
          listings and no lender dashboard.
        </Text>
      </View>
    </View>
  );
}
