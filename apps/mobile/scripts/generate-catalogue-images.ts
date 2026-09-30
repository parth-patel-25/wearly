/**
 * Regenerates `src/shared/data/catalogue-images.generated.ts`.
 *
 * Prototype imagery comes from DummyJSON's public product API — no key, no
 * signup. It is a stand-in, not the real thing: once the catalogue is served by
 * the API, lender uploads replace these URLs and this script is deleted.
 *
 * The source only has fifteen garment products, so pieces share photos. That is
 * visible if you scroll far enough, which is the right trade for a design
 * review: real photography in the first few screens beats 75 grey blocks
 * everywhere.
 *
 *   bun run images:generate
 */

import { writeFile } from "node:fs/promises";

const SOURCES = ["mens-shirts", "tops", "womens-dresses"] as const;

/** Seed names, in the order `catalogue.ts` declares them. */
const SEEDS = [
  "Satin slip dress",
  "Block-print wrap dress",
  "Linen column dress",
  "Embroidered anarkali",
  "Tiered cotton midi",
  "Hand-loomed silk saree",
  "Chikankari kurta set",
  "Bandhani lehenga",
  "Kalamkari palazzo set",
  "Cropped blazer",
  "Oversized denim jacket",
  "Belted trench coat",
  "Co-ord linen set",
  "Silk sharara set",
  "Pleated skirt and blouse",
  "Ribbed knit lounge set",
  "Oversized poplin shirt",
  "Silk camp collar",
  "Striped cotton tee",
  "Chambray work shirt",
  "Wide-leg linen trousers",
  "Pleated wool trousers",
  "Straight-leg jeans",
  "Paper-bag palazzos",
];

type Shots = readonly [string, string, string];

async function fetchShots(): Promise<Shots[]> {
  const bodies = await Promise.all(
    SOURCES.map(async (slug) => {
      const url = `https://dummyjson.com/products/category/${slug}?limit=0&select=images`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`DummyJSON ${slug} failed: ${response.status}`);
      }

      return (await response.json()) as {
        products: { images: string[] }[];
      };
    })
  );

  const shots: Shots[] = [];

  for (const body of bodies) {
    for (const product of body.products) {
      const [first, second, third] = product.images;

      if (first && second && third) {
        shots.push([first, second, third]);
      }
    }
  }

  if (shots.length === 0) {
    throw new Error("DummyJSON returned no usable garment imagery");
  }

  return shots;
}

async function main() {
  const shots = await fetchShots();
  const lines = SEEDS.map((name, index) => {
    const taken = shots[index % shots.length];

    if (taken === undefined) {
      throw new Error(`No imagery resolved for ${name}`);
    }

    return `  ${JSON.stringify(name)}: [${taken.map((url) => JSON.stringify(url)).join(", ")}],`;
  });

  const body = `/**
 * GENERATED — do not edit by hand.
 *
 * Regenerate with: \`bun run images:generate\`
 *
 * Prototype product photography from DummyJSON (public API, no key). These are
 * stock stand-ins for design review, not lender listings.
 */

export const CATALOGUE_IMAGES: Record<string, readonly [string, string, string]> = {
${lines.join("\n")}
};
`;

  await writeFile(
    new URL(
      "../src/shared/data/catalogue-images.generated.ts",
      import.meta.url
    ),
    body
  );

  console.log(`Wrote ${SEEDS.length} entries from ${shots.length} products.`);
}

await main();
