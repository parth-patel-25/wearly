import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { rentals } from "./rentals.js";

/**
 * Dispute entry point.
 *
 * This phase records the issue and moves the rental to `DISPUTED`, which blocks
 * capture/release. The resolution workflow (evidence, admin decision, refunds)
 * is deliberately not implemented yet.
 */
export const disputes = pgTable(
  "disputes",
  {
    category: text("category").notNull(),
    details: text("details").notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    openedAt: timestamp("opened_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    openedById: text("opened_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    rentalId: uuid("rental_id")
      .notNull()
      .references(() => rentals.id, { onDelete: "cascade" }),
    resolutionNotes: text("resolution_notes"),
    resolvedAt: timestamp("resolved_at", { withTimezone: true }),
    resolvedById: text("resolved_by_id").references(() => user.id, {
      onDelete: "set null",
    }),
    status: text("status").notNull().default("open"),
  },
  (table) => [index("disputes_rental_idx").on(table.rentalId, table.status)]
);
