import { Button as HeroButton, Card as HeroCard } from "@heroui/react";
import { Badge } from "@wearly/ui/components/ui/badge";
import { Button } from "@wearly/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@wearly/ui/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

const swatches = [
  "bg-background",
  "bg-card",
  "bg-muted",
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-destructive",
] as const;

export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 p-8">
      <header className="flex flex-row items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="font-semibold text-2xl tracking-tight">Wearly</h1>
          <p className="text-muted-foreground text-sm">
            Turborepo · Next.js · NestJS · Expo
          </p>
        </div>
        <ThemeToggle />
      </header>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-muted-foreground text-sm">
          Design tokens
        </h2>
        <div className="flex flex-row flex-wrap gap-2">
          {swatches.map((swatch) => (
            <div
              className={`flex h-12 w-20 flex-row items-end rounded-md border border-border p-2 ${swatch}`}
              key={swatch}
            >
              <span className="text-[10px] text-muted-foreground">
                {swatch.replace("bg-", "")}
              </span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-muted-foreground text-sm">shadcn/ui</h2>
        <Card>
          <CardHeader>
            <CardTitle>Built on the shared tokens</CardTitle>
            <CardDescription>
              Every colour resolves through{" "}
              <code className="font-mono text-xs">@wearly/design-tokens</code>.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-row flex-wrap items-center gap-2">
            <Button>Primary</Button>
            <Button variant="secondary">Secondary</Button>
            <Button variant="outline">Outline</Button>
            <Button variant="ghost">Ghost</Button>
            <Button variant="destructive">Destructive</Button>
            <Button variant="link">Link</Button>
            <Badge>Badge</Badge>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col gap-3">
        <h2 className="font-medium text-muted-foreground text-sm">HeroUI</h2>
        <HeroCard className="p-6">
          <div className="flex flex-col gap-3">
            <p className="text-sm">
              HeroUI web components are themed by the same OKLCH tokens, so they
              stay visually consistent with shadcn and with the mobile app.
            </p>
            <div className="flex flex-row flex-wrap items-center gap-2">
              <HeroButton>Primary</HeroButton>
              <HeroButton variant="secondary">Secondary</HeroButton>
              <HeroButton variant="ghost">Ghost</HeroButton>
            </div>
          </div>
        </HeroCard>
      </section>
    </main>
  );
}
