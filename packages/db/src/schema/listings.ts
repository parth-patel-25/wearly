import {
  doublePrecision,
  index,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const listings = pgTable(
  "listings",
  {
    /** Public, coarse area shown to renters, e.g. "Bandra West". */
    areaLabel: text("area_label"),
    availability: text("availability").array(),
    brand: text("brand"),
    category: text("category").notNull(),
    color: text("color"),
    condition: text("condition").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    description: text("description"),
    /** In-person only in this phase; delivery is reserved. */
    fulfillmentMethods: text("fulfillment_methods")
      .array()
      .notNull()
      .default(["in_person"]),
    id: uuid("id").defaultRandom().primaryKey(),
    /**
     * Private listing coordinates. Never selected into a public response; the
     * API computes distance and returns only an area label and a rounded value.
     */
    latitude: doublePrecision("latitude"),
    lenderId: text("lender_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    longitude: doublePrecision("longitude"),
    material: text("material"),
    photos: text("photos").array(),
    pricePerDay: text("price_per_day").notNull(),
    size: text("size").notNull(),
    status: text("status").notNull().default("draft"),
    subcategory: text("subcategory"),
    title: text("title").notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => [
    index("listings_status_location_idx").on(
      table.status,
      table.latitude,
      table.longitude
    ),
  ]
);
