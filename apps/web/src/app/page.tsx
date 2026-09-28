import { ProductCard } from "@wearly/ui/components/product-card";
import { Badge } from "@wearly/ui/components/ui/badge";
import { Button } from "@wearly/ui/components/ui/button";
import { ArrowRight, Heart, Search, Sparkles } from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { showcaseNav } from "./design-system/nav";

const featured = [
  {
    brand: "Zara",
    image: {
      alt: "Blush pink satin dress on a model",
      src: "/placeholders/dress.jpg",
    },
    location: "Indiranagar",
    pricePerDay: "₹299",
    rating: 4.8,
    reviewCount: 12,
    size: "S",
    title: "Satin slip dress",
  },
  {
    brand: "Everlane",
    image: {
      alt: "Cream wool blazer on a hanger",
      src: "/placeholders/blazer.jpg",
    },
    location: "Koramangala",
    pricePerDay: "₹399",
    rating: 4.9,
    reviewCount: 31,
    size: "M",
    title: "Structured wool blazer",
  },
  {
    brand: "Levi's",
    image: {
      alt: "Indigo denim jacket laid flat",
      src: "/placeholders/denim.jpg",
    },
    location: "HSR Layout",
    pricePerDay: "₹199",
    rating: 4.6,
    reviewCount: 8,
    size: "L",
    title: "Vintage denim jacket",
  },
];

const steps = [
  {
    body: "Search by size, occasion or brand and see what is available near you today.",
    title: "Find the piece",
  },
  {
    body: "Request it for your dates. Owners usually respond within a few hours.",
    title: "Request your dates",
  },
  {
    body: "Collect, wear it once, and send it back. Return postage is prepaid.",
    title: "Wear and return",
  },
];

export default function Home() {
  return (
    <div className="flex min-h-full flex-col">
      <header className="sticky top-0 z-40 border-border border-b bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-row items-center justify-between gap-4 px-page-inline py-4">
          <Link
            className="text-heading-sm focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-ring/25"
            href="/"
          >
            Wearly
          </Link>
          <div className="flex flex-row items-center gap-2">
            <Button asChild size="sm" variant="ghost">
              <Link href="/design-system">Design system</Link>
            </Button>
            <ThemeToggle />
          </div>
        </div>
      </header>

      <main className="flex flex-1 flex-col">
        {/* Hero — generous, airy, one clear action. */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-6 px-page-inline py-section">
          <Badge className="gap-1.5">
            <Sparkles aria-hidden="true" className="size-3" />
            Rent from people near you
          </Badge>
          <h1 className="max-w-2xl text-balance text-display">
            Wear the occasion. Return the cost.
          </h1>
          <p className="max-w-xl text-balance text-body-lg text-muted-foreground">
            Thousands of designer pieces already owned by people in your city.
            Book them by the day instead of buying something you will wear once.
          </p>
          <div className="flex w-full max-w-md flex-row items-center gap-3 rounded-pill border border-border bg-card p-2 shadow-soft focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
            <Search
              aria-hidden="true"
              className="ml-2 size-5 shrink-0 text-muted-foreground"
            />
            <input
              aria-label="Search listings"
              className="min-w-0 flex-1 bg-transparent text-body-md outline-none placeholder:text-muted-foreground"
              placeholder="Try “silk dress, size S”"
              type="search"
            />
            <Button className="shrink-0" size="sm">
              Search
            </Button>
          </div>
        </section>

        {/* Featured pieces — photography leads, as it should. */}
        <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-page-inline pb-section">
          <div className="flex flex-row items-end justify-between gap-4">
            <h2 className="text-heading-lg">Available near you</h2>
            <Button asChild size="sm" variant="ghost">
              <Link href="/design-system">
                See all
                <ArrowRight aria-hidden="true" className="size-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3">
            {featured.map((item) => (
              <ProductCard href="#" key={item.title} {...item} />
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="border-border border-t bg-muted/40">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-page-inline py-section">
            <h2 className="text-heading-lg">How it works</h2>
            <ol className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {steps.map((step, index) => (
                <li
                  className="flex flex-col gap-2 rounded-card border border-border bg-card p-5"
                  key={step.title}
                >
                  <span className="text-caption text-muted-foreground">
                    Step {index + 1}
                  </span>
                  <h3 className="text-heading-sm">{step.title}</h3>
                  <p className="text-body-sm text-muted-foreground">
                    {step.body}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="mx-auto flex w-full max-w-6xl flex-col items-start gap-5 px-page-inline py-section">
          <div className="flex flex-col gap-2 rounded-sheet border border-border bg-accent p-8">
            <span className="flex size-11 items-center justify-center rounded-badge bg-card text-primary">
              <Heart aria-hidden="true" className="size-5" />
            </span>
            <h2 className="text-heading-md">Your wardrobe could be earning</h2>
            <p className="max-w-lg text-accent-foreground text-body-md">
              List the pieces you own but rarely wear, set your prices and
              availability, and approve the rentals you are happy with.
            </p>
            <Button className="mt-2">Start listing</Button>
          </div>
        </section>
      </main>

      <footer className="mt-auto border-border border-t">
        <div className="mx-auto flex w-full max-w-6xl flex-row flex-wrap items-center justify-between gap-3 px-page-inline py-6">
          <p className="text-caption text-muted-foreground">
            Wearly — a clothing rental marketplace.
          </p>
          <nav aria-label="Design system">
            <ul className="flex flex-row flex-wrap gap-3">
              {showcaseNav.slice(0, 6).map((item) => (
                <li key={item.id}>
                  <Link
                    className="text-caption text-muted-foreground transition-colors hover:text-foreground"
                    href={`/design-system#${item.id}`}
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </footer>
    </div>
  );
}
