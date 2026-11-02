import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.js";

export const listings = pgTable("listings", {
  id: uuid("id").defaultRandom().primaryKey(),
  lenderId: text("lender_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull(),
  subcategory: text("subcategory"),
  size: text("size").notNull(),
  condition: text("condition").notNull(),
  description: text("description"),
  brand: text("brand"),
  color: text("color"),
  material: text("material"),
  pricePerDay: text("price_per_day").notNull(),
  status: text("status").notNull().default("draft"),
  photos: text("photos").array(),
  availability: text("availability").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
