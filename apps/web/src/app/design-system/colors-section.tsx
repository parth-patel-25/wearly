import { brand, statuses, surfaces, text } from "./data";
import { Group, Section } from "./section";
import { SwatchGrid } from "./swatches";

export function ColorsSection() {
  return (
    <Section
      description="Roughly 80% neutral, 15% brand, 5% status. Rose is an accent, never a background — if a screen reads as pink, something has gone too far."
      id="colors"
      title="Colour"
    >
      <Group label="Surfaces">
        <SwatchGrid items={surfaces} />
      </Group>

      <Group label="Brand">
        <SwatchGrid items={brand} />
      </Group>

      <Group label="Text">
        <SwatchGrid items={text} />
      </Group>

      <Group label="Status — each is a soft surface plus a foreground tone that clears AA">
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {statuses.map((status) => (
            <div
              className={`flex flex-col gap-2 rounded-card border border-border p-4 ${status.className}`}
              key={status.label}
            >
              <span
                className={`font-medium text-body-sm ${status.foregroundClassName}`}
              >
                {status.label}
              </span>
              <code
                className={`text-caption ${status.foregroundClassName} opacity-80`}
              >
                {status.hex}
              </code>
            </div>
          ))}
        </div>
      </Group>
    </Section>
  );
}
