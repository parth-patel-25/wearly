import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { listings } from "./listings.js";

/**
 * Saved pieces.
 *
 * `userId` is the account that saved the piece, independent of the listing's
 * lender: you save other people's pieces, and the row records who saved what.
 * The pair is one favouriting event — idempotent on both the API surface and
 * the database.
 */
export const favourites = pgTable(
  "favourites",
  {
    createdAt: timestamp("created_at").defaultNow().notNull(),
    listingId: uuid("listing_id")
      .references(() => listings.id, { onDelete: "cascade" })
      .notNull(),
    userId: text("user_id")
      .references(() => user.id, { onDelete: "cascade" })
      .notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.userId, table.listingId] }),
    index("favourites_user_id_idx").on(table.userId),
  ]
);
