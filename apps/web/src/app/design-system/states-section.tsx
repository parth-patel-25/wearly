"use client";

import { Button } from "@wearly/ui/components/ui/button";
import { Skeleton } from "@wearly/ui/components/ui/skeleton";
import {
  EmptyState,
  ErrorState,
  LoadingState,
} from "@wearly/ui/components/ui/states";
import { PackageOpen, WifiOff } from "lucide-react";
import { useCallback, useState } from "react";
import { Group, Section } from "./section";

export function StatesSection() {
  const [phase, setPhase] = useState<"loading" | "ready">("loading");
  const retry = useCallback(() => setPhase("loading"), []);
  const reload = useCallback(() => setPhase("ready"), []);

  return (
    <Section
      description="Every major component accounts for default, hover, focus, pressed, active, disabled, loading, error and success. These are the three whole-screen cases."
      id="states"
      title="States"
    >
      <Group label="Empty — explain the situation and offer the next step">
        <EmptyState
          action={
            <Button size="sm" variant="soft">
              List your first item
            </Button>
          }
          description="Once you add a listing, renters nearby will be able to find it."
          icon={PackageOpen}
          title="No listings yet"
        />
      </Group>

      <Group label="Error — always offer a retry when the failure is transient">
        <ErrorState
          description="We couldn't reach the rentals service. Check your connection and try again."
          onRetry={retry}
          title="Couldn't load rentals"
        />
        <ErrorState
          description="This happens when something goes wrong on our side rather than yours."
          title="Something went wrong"
        />
      </Group>

      <Group label="Loading">
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          <div className="rounded-card border border-border bg-card p-5">
            <LoadingState label="Loading listings" />
            <p className="text-center text-caption text-muted-foreground">
              <code>LoadingState</code> for a whole region
            </p>
          </div>
          <div className="rounded-card border border-border bg-card p-5">
            <div aria-busy="true" className="flex flex-col gap-3">
              <div className="flex flex-row items-center gap-3">
                <Skeleton className="size-12 rounded-media" />
                <div className="flex flex-1 flex-col gap-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              </div>
              <Skeleton className="h-3 w-1/3" />
              <Skeleton className="h-3 w-1/4" />
            </div>
            <p className="mt-4 text-center text-caption text-muted-foreground">
              <code>Skeleton</code> for content that keeps its shape
            </p>
          </div>
        </div>
        <div className="flex justify-center">
          <Button onClick={reload} size="sm" variant="outline">
            {phase === "loading" ? "Finish loading" : "Reload"}
          </Button>
        </div>
      </Group>

      <Group label="Offline — an icon keeps an empty state from feeling like a failure">
        <EmptyState
          description="Reconnect to browse and rent from your wishlist."
          icon={WifiOff}
          title="You're offline"
        />
      </Group>
    </Section>
  );
}
