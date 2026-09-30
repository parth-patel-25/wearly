/**
 * Prototype catalogue.
 *
 * Every piece here is invented. There are no real listings, no real lenders and
 * no real people behind these names — the UI says so in a few places and the
 * README says so in one. What they are for is exercising the layout, the
 * progressive disclosure and the rental flow with enough volume to find out
 * whether a fifty-item grid still feels calm.
 *
 * The catalogue is generated from a handful of name/price seeds rather than
 * written out fifty times, because hand-written duplicate rows drift apart and
 * a grid where every card has a subtly different shape is very hard to design
 * against.
 */

import type { PlaceholderTone } from "@wearly/ui-native/media";

export const CATALOGUE_DISCLAIMER =
  "Prototype catalogue. Every item, lender and price here is invented for design review.";

export const CONDITION_LABEL = {
  excellent: "Excellent",
  "good-condition": "Very good",
  "like-new": "Like new",
} as const;

export type Condition = keyof typeof CONDITION_LABEL;

export const CONDITION_NOTE = {
  excellent: "Worn once or twice, no marks.",
  "good-condition": "Gently worn, no visible flaws.",
  "like-new": "Unworn, tags on where they can stay.",
} as const;

export type Category =
  | "Dresses"
  | "Ethnic"
  | "Jackets"
  | "Sets"
  | "Shirts"
  | "Trousers";

export interface Lender {
  name: string;
  neighbourhood: string;
  /** Kept in the data so the product page can say "verification is not part of this prototype" honestly. */
  verified: boolean;
}

export interface Piece {
  availableFrom: string;
  category: Category;
  condition: Condition;
  /** Rupees per day. */
  dailyRate: number;
  deposit: number;
  description: string;
  /** Three hues, so the placeholder gallery can vary without inventing photography. */
  gallery: readonly [PlaceholderTone, PlaceholderTone, PlaceholderTone];
  id: string;
  lender: Lender;
  name: string;
  /** ISO date the piece is already committed and cannot be rented. */
  unavailable: readonly string[];
}

interface Seed {
  category: Category;
  dailyRate: number;
  name: string;
  size: string;
}

const LENDERS: readonly Lender[] = [
  { name: "Ananya Rao", neighbourhood: "Indiranagar", verified: true },
  { name: "Meera Iyer", neighbourhood: "Koramangala", verified: false },
  { name: "Rhea Kapoor", neighbourhood: "Hauz Khas", verified: true },
  { name: "Sana Qureshi", neighbourhood: "Banjara Hills", verified: false },
  { name: "Divya Menon", neighbourhood: "Viman Nagar", verified: true },
  { name: "Kavya Nair", neighbourhood: "Kochi", verified: false },
];

const NEIGHBOURHOODS = [
  "Indiranagar",
  "Koramangala",
  "Banjara Hills",
  "Juhu",
  "Hauz Khas",
  "Bandra West",
] as const;

const CONDITIONS: readonly Condition[] = [
  "like-new",
  "excellent",
  "good-condition",
];

const TONES: readonly PlaceholderTone[] = [
  "accent",
  "info",
  "muted",
  "secondary",
  "success",
  "warning",
];

const SEEDS: readonly Seed[] = [
  { category: "Dresses", dailyRate: 499, name: "Satin slip dress", size: "S" },
  {
    category: "Dresses",
    dailyRate: 549,
    name: "Block-print wrap dress",
    size: "M",
  },
  {
    category: "Dresses",
    dailyRate: 429,
    name: "Linen column dress",
    size: "M/L",
  },
  {
    category: "Dresses",
    dailyRate: 649,
    name: "Embroidered anarkali",
    size: "L",
  },
  {
    category: "Dresses",
    dailyRate: 379,
    name: "Tiered cotton midi",
    size: "XS",
  },
  {
    category: "Ethnic",
    dailyRate: 599,
    name: "Hand-loomed silk saree",
    size: "S/M",
  },
  {
    category: "Ethnic",
    dailyRate: 699,
    name: "Chikankari kurta set",
    size: "M",
  },
  { category: "Ethnic", dailyRate: 449, name: "Bandhani lehenga", size: "S" },
  {
    category: "Ethnic",
    dailyRate: 529,
    name: "Kalamkari palazzo set",
    size: "L",
  },
  { category: "Jackets", dailyRate: 749, name: "Cropped blazer", size: "M" },
  {
    category: "Jackets",
    dailyRate: 829,
    name: "Oversized denim jacket",
    size: "L/XL",
  },
  {
    category: "Jackets",
    dailyRate: 689,
    name: "Belted trench coat",
    size: "M/L",
  },
  { category: "Sets", dailyRate: 799, name: "Co-ord linen set", size: "S" },
  { category: "Sets", dailyRate: 899, name: "Silk sharara set", size: "L" },
  {
    category: "Sets",
    dailyRate: 649,
    name: "Pleated skirt and blouse",
    size: "XS",
  },
  {
    category: "Sets",
    dailyRate: 739,
    name: "Ribbed knit lounge set",
    size: "S/M",
  },
  {
    category: "Shirts",
    dailyRate: 349,
    name: "Oversized poplin shirt",
    size: "M",
  },
  { category: "Shirts", dailyRate: 389, name: "Silk camp collar", size: "L" },
  { category: "Shirts", dailyRate: 299, name: "Striped cotton tee", size: "S" },
  {
    category: "Shirts",
    dailyRate: 419,
    name: "Chambray work shirt",
    size: "XL",
  },
  {
    category: "Trousers",
    dailyRate: 429,
    name: "Wide-leg linen trousers",
    size: "M",
  },
  {
    category: "Trousers",
    dailyRate: 479,
    name: "Pleated wool trousers",
    size: "L",
  },
  {
    category: "Trousers",
    dailyRate: 369,
    name: "Straight-leg jeans",
    size: "S/M",
  },
  {
    category: "Trousers",
    dailyRate: 399,
    name: "Paper-bag palazzos",
    size: "L/XL",
  },
];

/** Deterministic, so the catalogue is stable across reloads and screenshots. */
function pseudoRandom(seed: number): number {
  const value = Math.sin(seed * 12.9898) * 43_758.5453;
  return value - Math.floor(value);
}

function isoDate(dayOffset: number): string {
  const base = new Date();
  base.setHours(0, 0, 0, 0);
  base.setDate(base.getDate() + dayOffset);
  return base.toISOString().slice(0, 10);
}

/** Two days a month are already committed, so the calendar has something to refuse. */
function blockedDays(index: number): readonly string[] {
  return [isoDate(6 + (index % 4)), isoDate(13 + (index % 5))];
}

const SIZE_BY_NAME = new Map(SEEDS.map((seed) => [seed.name, seed.size]));

/** Index into a non-empty list, with the modulo guarding the length. */
function at<T>(list: readonly T[], index: number): T {
  const value = list[((index % list.length) + list.length) % list.length];
  if (value === undefined) {
    throw new Error("Catalogue lists must not be empty");
  }
  return value;
}

function buildPiece(seed: Seed, colourway: string, index: number): Piece {
  const lender = at(LENDERS, index);
  const condition = at(CONDITIONS, index);
  const firstName = lender.name.split(" ")[0] ?? lender.name;
  const size = SIZE_BY_NAME.get(seed.name) ?? "M";
  const name = `${seed.name} · ${colourway}`;

  return {
    availableFrom: isoDate(1 + (index % 5)),
    category: seed.category,
    condition,
    dailyRate: seed.dailyRate + Math.round(pseudoRandom(index + 1) * 6) * 10,
    deposit: 1000 + (index % 4) * 500,
    description: `${CONDITION_NOTE[condition]} ${size} · Listed by ${firstName}, who rents out pieces she has worn and put away. Dry clean only.`,
    gallery: [at(TONES, index), at(TONES, index + 2), at(TONES, index + 4)],
    id: `w-${String(index + 1).padStart(3, "0")}`,
    lender: { ...lender, neighbourhood: at(NEIGHBOURHOODS, index) },
    name,
    unavailable: blockedDays(index),
  };
}

const COLOURWAYS = ["Rose", "Ink", "Sand"] as const;

function buildCatalogue(): readonly Piece[] {
  const pieces: Piece[] = [];
  let index = 0;
  for (const seed of SEEDS) {
    for (const colourway of COLOURWAYS) {
      index += 1;
      pieces.push(buildPiece(seed, colourway, index));
    }
  }
  return pieces;
}

export const CATALOGUE: readonly Piece[] = buildCatalogue();

/** The single piece the home screen leads with. Not "trending" — just a choice. */
export const FEATURED: Piece = CATALOGUE[5] as Piece;

export const CATEGORIES: readonly Category[] = [
  "Dresses",
  "Ethnic",
  "Jackets",
  "Sets",
  "Shirts",
  "Trousers",
];

export const SIZE_FILTERS: readonly string[] = ["XS", "S", "M", "L", "XL"];

export function sizeOf(piece: Piece): string {
  const [base] = piece.name.split(" · ");
  return SIZE_BY_NAME.get(base ?? "") ?? "M";
}

export function findPiece(id: string): Piece | undefined {
  return CATALOGUE.find((piece) => piece.id === id);
}

export function isAvailable(piece: Piece, day: string): boolean {
  return !piece.unavailable.includes(day) && day >= piece.availableFrom;
}

export function formatRupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

/** "₹1,498 · 3 days" — the one string a product card shows for money. */
export function rentalSummary(piece: Piece, days: number): string {
  return `${formatRupees(piece.dailyRate * days)} · ${days} ${days === 1 ? "day" : "days"}`;
}
