import { ThemeToggle } from "@/components/theme-toggle";
import { ColorsSection } from "./colors-section";
import { ControlsSection } from "./controls-section";
import { FoundationsSection } from "./foundations-section";
import { showcaseNav } from "./nav";
import { OverlaysSection } from "./overlays-section";
import { StatesSection } from "./states-section";
import { SurfacesSection } from "./surfaces-section";

/**
 * Internal design-system showcase.
 *
 * Every value here resolves through `@wearly/design-tokens`, so this page
 * doubles as the regression test for the token layer: if a token changes, this
 * page is where you see it. Toggle the theme to check both palettes at once.
 */
export const metadata = {
  description:
    "Internal reference for the Wearly design system: colour, typography, radius, spacing, elevation and components.",
  title: "Design system",
};

export default function DesignSystemPage() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-border border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-page-inline py-4">
          <div className="flex flex-row items-center justify-between gap-4">
            <div className="flex flex-col gap-0.5">
              <p className="text-body-sm text-muted-foreground">
                Internal reference
              </p>
              <h1 className="text-heading-md">Wearly design system</h1>
            </div>
            <ThemeToggle />
          </div>
          <nav aria-label="Sections">
            <ul className="no-scrollbar -mx-1 flex flex-row gap-1 overflow-x-auto px-1 pb-0.5">
              {showcaseNav.map((item) => (
                <li className="shrink-0" key={item.id}>
                  <a
                    className="inline-flex h-8 items-center rounded-pill px-3 text-button-sm text-muted-foreground transition-colors duration-150 ease-out hover:bg-accent hover:text-accent-foreground focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
                    href={`#${item.id}`}
                  >
                    {item.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-section px-page-inline py-section">
        <ColorsSection />
        <FoundationsSection />
        <ControlsSection />
        <SurfacesSection />
        <OverlaysSection />
        <StatesSection />
      </main>

      <footer className="border-border border-t">
        <div className="mx-auto w-full max-w-6xl px-page-inline py-6 text-caption text-muted-foreground">
          Tokens live in <code>packages/design-tokens</code>. Change{" "}
          <code>--wearly-primary</code> there and every surface on this page —
          and both apps — moves with it.
        </div>
      </footer>
    </div>
  );
}
