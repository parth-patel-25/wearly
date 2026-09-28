"use client";

import { Badge } from "@wearly/ui/components/ui/badge";
import { Button } from "@wearly/ui/components/ui/button";
import { Input } from "@wearly/ui/components/ui/input";
import { Label } from "@wearly/ui/components/ui/label";
import { Search } from "lucide-react";
import type { ChangeEvent } from "react";
import { useCallback, useState } from "react";
import { Group, Section } from "./section";

export function ControlsSection() {
  const [query, setQuery] = useState("");
  const handleQueryChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => setQuery(event.target.value),
    []
  );

  return (
    <>
      <Section
        description="Pill-shaped, 44px tall by default, and animated only on colour. Try the focus ring by tabbing through — it is a soft rose glow, not a hard outline."
        id="buttons"
        title="Buttons"
      >
        <Group label="Variants">
          <div className="flex flex-wrap items-center gap-3">
            <Button>Primary</Button>
            <Button variant="soft">Soft</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Delete</Button>
            <Button variant="link">Link</Button>
          </div>
        </Group>

        <Group label="Sizes">
          <div className="flex flex-wrap items-center gap-3">
            <Button size="sm">Small</Button>
            <Button size="default">Default</Button>
            <Button size="lg">Large</Button>
            <Button aria-label="Favourites" size="icon">
              <span aria-hidden="true">♡</span>
            </Button>
          </div>
        </Group>

        <Group label="States">
          <div className="flex flex-wrap items-center gap-3">
            <Button disabled>Disabled</Button>
            <Button loading>Saving</Button>
            <Button loading variant="outline">
              Confirming
            </Button>
            <Button disabled variant="soft">
              Unavailable
            </Button>
          </div>
        </Group>
      </Section>

      <Section
        description="16px radius, a soft surface, and a rose focus ring. Search fields are fully rounded to separate them from form fields at a glance."
        id="inputs"
        title="Inputs"
      >
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div className="flex flex-col gap-3">
            <Label htmlFor="ds-text">Full name</Label>
            <Input id="ds-text" placeholder="Priya Sharma" />
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="ds-search">Search listings</Label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                className="h-11 rounded-pill pr-4 pl-11"
                id="ds-search"
                onChange={handleQueryChange}
                placeholder="Try “pink dress”"
                type="search"
                value={query}
              />
            </div>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="ds-invalid">Email</Label>
            <Input
              aria-invalid="true"
              defaultValue="priya@"
              id="ds-invalid"
              placeholder="you@example.com"
            />
            <p className="text-caption text-destructive-foreground">
              Enter a complete email address.
            </p>
          </div>
          <div className="flex flex-col gap-3">
            <Label htmlFor="ds-disabled">Owner</Label>
            <Input
              defaultValue="Assigned automatically"
              disabled
              id="ds-disabled"
            />
          </div>
        </div>
      </Section>

      <Section
        description="Pill-shaped and quiet. The four status variants pair a soft surface with a foreground tone, so badge text always clears AA."
        id="badges"
        title="Badges"
      >
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Default</Badge>
            <Badge size="sm">Small</Badge>
            <Badge variant="secondary">Rented</Badge>
            <Badge variant="success">Available</Badge>
            <Badge variant="warning">Pending</Badge>
            <Badge variant="info">Near you</Badge>
            <Badge variant="destructive">Disputed</Badge>
            <Badge variant="outline">Verified</Badge>
            <Badge variant="ghost">Popular</Badge>
          </div>
        </div>
      </Section>
    </>
  );
}
