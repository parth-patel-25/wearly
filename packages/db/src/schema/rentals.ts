import {
  date,
  index,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  uuid,
} from "drizzle-orm/pg-core";
import { user } from "./auth.js";
import { listings } from "./listings.js";

/**
 * A rental is a snapshot: price, fees and duration are copied at request time
 * so a later listing edit cannot rewrite a live booking.
 *
 * `payment_status` is intentionally separate from `status`. A rental can be
 * confirmed before money moves, and connecting a provider later must not change
 * the rental state machine.
 */
export const rentals = pgTable(
  "rentals",
  {
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),

    activatedAt: timestamp("activated_at", { withTimezone: true }),
    authorizedAt: timestamp("authorized_at", { withTimezone: true }),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    cancelledBy: text("cancelled_by"),
    cancelReason: text("cancel_reason"),
    capturedAt: timestamp("captured_at", { withTimezone: true }),
    cleaningFeeRupees: integer("cleaning_fee_rupees").notNull().default(0),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    currency: text("currency").notNull().default("INR"),
    days: integer("days").notNull(),
    declinedAt: timestamp("declined_at", { withTimezone: true }),
    /** Reserved for the deposit phase; never charged in this build. */
    depositRupees: integer("deposit_rupees").notNull().default(0),
    endDate: date("end_date").notNull(),
    fulfillmentMethod: text("fulfillment_method")
      .notNull()
      .default("in_person"),
    handoverAcknowledgedAt: timestamp("handover_acknowledged_at", {
      withTimezone: true,
    }),
    id: uuid("id").defaultRandom().primaryKey(),
    lenderId: text("lender_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),
    listingId: uuid("listing_id")
      .notNull()
      .references(() => listings.id, { onDelete: "restrict" }),
    noShowReportedAt: timestamp("no_show_reported_at", { withTimezone: true }),

    noShowReportedBy: text("no_show_reported_by"),
    paymentProvider: text("payment_provider"),
    paymentReference: text("payment_reference"),

    paymentStatus: text("payment_status").notNull().default("not_started"),

    pricePerDayRupees: integer("price_per_day_rupees").notNull(),
    refundedAt: timestamp("refunded_at", { withTimezone: true }),
    rentalAmountRupees: integer("rental_amount_rupees").notNull(),
    renterId: text("renter_id")
      .notNull()
      .references(() => user.id, { onDelete: "restrict" }),

    requestedAt: timestamp("requested_at", { withTimezone: true })
      .defaultNow()
      .notNull(),

    requestedNote: text("requested_note"),
    respondByAt: timestamp("respond_by_at", { withTimezone: true }).notNull(),
    returnDueAt: timestamp("return_due_at", { withTimezone: true }),
    returnedAt: timestamp("returned_at", { withTimezone: true }),

    startDate: date("start_date").notNull(),
    status: text("status").notNull().default("requested"),
    totalRupees: integer("total_rupees").notNull(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date())
      .notNull(),
    voidedAt: timestamp("voided_at", { withTimezone: true }),
  },
  (table) => [
    index("rentals_renter_status_idx").on(table.renterId, table.status),
    index("rentals_lender_status_idx").on(table.lenderId, table.status),
    index("rentals_listing_window_idx").on(
      table.listingId,
      table.status,
      table.startDate,
      table.endDate
    ),
    index("rentals_respond_by_idx").on(table.respondByAt),
  ]
);

/** Append-only audit trail and the timeline the rental detail renders. */
export const rentalEvents = pgTable(
  "rental_events",
  {
    actorId: text("actor_id").references(() => user.id, {
      onDelete: "set null",
    }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
    fromStatus: text("from_status"),
    id: uuid("id").defaultRandom().primaryKey(),
    metadata: jsonb("metadata").$type<Record<string, unknown>>(),
    rentalId: uuid("rental_id")
      .notNull()
      .references(() => rentals.id, { onDelete: "cascade" }),
    toStatus: text("to_status"),
    type: text("type").notNull(),
  },
  (table) => [
    index("rental_events_rental_idx").on(table.rentalId, table.createdAt),
  ]
);
