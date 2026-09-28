"use client";

import { ProductCard } from "@wearly/ui/components/product-card";
import { Badge } from "@wearly/ui/components/ui/badge";
import { Button } from "@wearly/ui/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@wearly/ui/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@wearly/ui/components/ui/table";
import { useMemo, useState } from "react";
import { Section } from "./section";

const products = [
  {
    brand: "Zara",
    condition: "new" as const,
    href: "#",
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
    condition: null,
    href: "#",
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
    condition: "popular" as const,
    href: "#",
    image: {
      alt: "Indigo denim jacket laid flat",
      src: "/placeholders/denim.jpg",
    },
    location: "HSR Layout",
    pricePerDay: "₹199",
    reviewCount: 8,
    size: "L",
    title: "Vintage denim jacket",
  },
  {
    availability: "rented" as const,
    brand: "Uniqlo",
    condition: null,
    href: "#",
    image: { alt: "Linen shirt in oatmeal", src: "/placeholders/shirt.jpg" },
    pricePerDay: "₹149",
    rating: 4.5,
    reviewCount: 5,
    size: "S",
    title: "Relaxed linen shirt",
  },
];

const rows = [
  {
    id: "1",
    listing: "Satin slip dress",
    owner: "Priya",
    price: "₹299/day",
    status: "success" as const,
    statusLabel: "Available",
  },
  {
    id: "2",
    listing: "Vintage denim jacket",
    owner: "Aarav",
    price: "₹199/day",
    status: "warning" as const,
    statusLabel: "Rented",
  },
  {
    id: "3",
    listing: "Structured wool blazer",
    owner: "Riya",
    price: "₹399/day",
    status: "info" as const,
    statusLabel: "Pending",
  },
  {
    id: "4",
    listing: "Relaxed linen shirt",
    owner: "Kabir",
    price: "₹149/day",
    status: "secondary" as const,
    statusLabel: "In transit",
  },
];

export function SurfacesSection() {
  const [favourites, setFavourites] = useState<Set<string>>(() => new Set());

  // One stable callback per card, built inside a single `useMemo`. Building
  // them in a factory that called a hook would break the rules of hooks, and
  // building them inline in JSX would re-create every callback on each render.
  // `setFavourites` is stable, so the empty dependency list is correct.
  const handlers = useMemo(
    () =>
      Object.fromEntries(
        products.map((product) => [
          product.title,
          () => {
            setFavourites((previous) => {
              const next = new Set(previous);
              if (next.has(product.title)) {
                next.delete(product.title);
              } else {
                next.add(product.title);
              }
              return next;
            });
          },
        ])
      ),
    []
  );

  return (
    <>
      <Section
        description="24px radius, a hairline border, and the faintest shadow. Photography should carry the visual weight, not the container."
        id="cards"
        title="Cards"
      >
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Rental request</CardTitle>
            <CardDescription>
              Priya would like to rent the satin slip dress for 4 days.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <div className="flex flex-row items-center justify-between rounded-pill bg-muted px-4 py-2">
              <span className="text-body-sm text-muted-foreground">Dates</span>
              <span className="font-medium text-body-sm">12 – 16 Aug</span>
            </div>
            <div className="flex flex-row items-center justify-between rounded-pill bg-muted px-4 py-2">
              <span className="text-body-sm text-muted-foreground">Total</span>
              <span className="font-medium text-body-sm">₹1,196</span>
            </div>
          </CardContent>
          <CardFooter className="gap-3 border-t">
            <Button className="flex-1" size="sm">
              Approve
            </Button>
            <Button size="sm" variant="outline">
              Decline
            </Button>
          </CardFooter>
        </Card>
      </Section>

      <Section
        description="The marketplace's primary unit of content. The 4:5 image dominates, the favourite button sits in the padding rather than over the garment, and metadata is capped at three facts — a card that shows everything communicates nothing."
        id="product-cards"
        title="Product cards"
      >
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {products.map((product) => (
            <ProductCard
              {...product}
              favorited={favourites.has(product.title)}
              key={product.title}
              onFavoriteChange={handlers[product.title]}
            />
          ))}
        </div>
      </Section>

      <Section
        description="Admin tables stay soft: a rounded container, hairline row separators, comfortable row height, and pill status badges."
        id="tables"
        title="Tables"
      >
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Listing</TableHead>
              <TableHead>Owner</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {rows.map((row) => (
              <TableRow key={row.id}>
                <TableCell className="font-medium text-foreground">
                  {row.listing}
                </TableCell>
                <TableCell className="text-muted-foreground">
                  {row.owner}
                </TableCell>
                <TableCell>{row.price}</TableCell>
                <TableCell>
                  <Badge variant={row.status}>{row.statusLabel}</Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Section>
    </>
  );
}
