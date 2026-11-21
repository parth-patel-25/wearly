import { index, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { rentals } from "./rentals.js";

/**
 * A meetup proposal.
 *
 * Only a public place is stored: a venue name and a coarse area. No street
 * address and no coordinates, so accepting a meetup can never reveal a home.
 * Counter-proposals create a new row and supersede the previous one, which keeps
 * the negotiation in the event history instead of overwriting it.
 */
export const meetupProposals = pgTable(
  "meetup_proposals",
  {
    areaLabel: text("area_label").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    id: uuid("id").defaultRandom().primaryKey(),
    note: text("note"),
    placeName: text("place_name").notNull(),
    proposedById: text("proposed_by_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    rentalId: uuid("rental_id")
      .notNull()
      .references(() => rentals.id, { onDelete: "cascade" }),
    respondedAt: timestamp("responded_at", { withTimezone: true }),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    status: text("status").notNull().default("proposed"),
  },
  (table) => [
    index("meetup_proposals_rental_status_idx").on(
      table.rentalId,
      table.status
    ),
  ]
);
