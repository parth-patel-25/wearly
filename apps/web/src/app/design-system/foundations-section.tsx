import { cn } from "cn";
import { componentRadius, elevation, radius, spacing, typeScale } from "./data";
import { Group, Section } from "./section";

export function FoundationsSection() {
  return (
    <>
      <Section
        description="Satoshi has no 600 weight, so the scale uses 500 for headings rather than inventing a semibold. Large headings set lighter also read more editorial than bold."
        id="typography"
        title="Typography"
      >
        <div className="flex flex-col divide-y divide-border rounded-card border border-border bg-card">
          {typeScale.map((step) => (
            <div
              className="flex flex-row flex-wrap items-baseline justify-between gap-4 p-5"
              key={step.utility}
            >
              <span className={cn("truncate", step.utility)}>
                Rent the dress you will wear once
              </span>
              <span className="shrink-0 text-caption text-muted-foreground">
                <code>{step.utility}</code> · {step.use} · {step.px}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section
        description="Large radius is the most recognisable part of the Wearly silhouette. Prefer the component names — re-theming one component is then a single token change."
        id="radius"
        title="Radius"
      >
        <Group label="Scale">
          <div className="flex flex-wrap gap-3">
            {radius.map((step) => (
              <div
                className="flex size-24 flex-col items-center justify-center gap-2 border border-border bg-card"
                key={step.token}
                style={{ borderRadius: `var(${step.token})` }}
              >
                <span className="font-medium text-body-sm">{step.px}</span>
                <code className="text-caption text-muted-foreground">
                  {step.utility}
                </code>
              </div>
            ))}
          </div>
        </Group>

        <Group label="Component defaults">
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {componentRadius.map((item) => (
              <div
                className={cn(
                  "flex h-24 items-center justify-center border border-border bg-card text-body-sm",
                  item.utility
                )}
                key={item.utility}
              >
                <span className="text-caption text-muted-foreground">
                  {item.use} · {item.px}
                </span>
              </div>
            ))}
          </div>
        </Group>
      </Section>

      <Section
        description="Airy by default. When a layout feels tight, add a step here rather than inventing an arbitrary value."
        id="spacing"
        title="Spacing"
      >
        <div className="flex flex-col gap-2 rounded-card border border-border bg-card p-5">
          {spacing.map((px) => (
            <div className="flex flex-row items-center gap-4" key={px}>
              <span className="w-12 shrink-0 text-caption text-muted-foreground">
                {px}
              </span>
              <div
                className="h-4 rounded-xs bg-accent"
                style={{ width: `${(px / 96) * 100}%` }}
              />
            </div>
          ))}
        </div>
      </Section>

      <Section
        description="Barely noticeable. Surfaces are separated by borders and tonal shifts first; shadows are reserved for things that genuinely float."
        id="elevation"
        title="Elevation"
      >
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
          {elevation.map((level) => (
            <div
              className={cn(
                "flex h-32 flex-col items-center justify-center gap-2 rounded-card border border-border bg-card",
                level.utility
              )}
              key={level.utility}
            >
              <code className="font-medium text-body-sm">{level.utility}</code>
              <span className="text-caption text-muted-foreground">
                {level.use}
              </span>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}
