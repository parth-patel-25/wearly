import { Injectable } from "@nestjs/common";
import { db } from "@wearly/db/client";
import { user } from "@wearly/db/schema/auth";
import { listings } from "@wearly/db/schema/listings";
import { rentals } from "@wearly/db/schema/rentals";
import type {
  ListRentalsQuery,
  ListRentalsResponse,
} from "@wearly/shared/api/types";
import { and, count, desc, eq, inArray, or } from "drizzle-orm";
import { toListing } from "../listings/listing-mapper.js";
import { RentalMaintenanceService } from "./rental-maintenance.js";
import {
  counterpartyFrom,
  counterpartyIdFor,
  toRentalSummary,
} from "./rental-mappers.js";

/** The Renting/Lending list. Meetups are omitted; the detail screen owns them. */
@Injectable()
export class RentalListService {
  constructor(private readonly maintenance: RentalMaintenanceService) {}

  async list(
    userId: string,
    query: ListRentalsQuery
  ): Promise<ListRentalsResponse> {
    await this.maintenance.run();

    const roleFilter = roleWhere(userId, query.role);
    const where = query.status
      ? and(roleFilter, eq(rentals.status, query.status))
      : roleFilter;

    const [rows, totals] = await Promise.all([
      db
        .select()
        .from(rentals)
        .where(where)
        .orderBy(desc(rentals.requestedAt))
        .limit(query.limit)
        .offset(query.offset),
      db.select({ value: count() }).from(rentals).where(where),
    ]);

    if (rows.length === 0) {
      return {
        items: [],
        limit: query.limit,
        offset: query.offset,
        total: Number(totals[0]?.value ?? 0),
      };
    }

    const listingIds = [...new Set(rows.map((row) => row.listingId))];
    const userIds = [
      ...new Set(rows.flatMap((row) => [row.lenderId, row.renterId])),
    ];

    const [listingRows, userRows] = await Promise.all([
      db.select().from(listings).where(inArray(listings.id, listingIds)),
      db.select().from(user).where(inArray(user.id, userIds)),
    ]);

    const listingById = new Map(
      listingRows.map((row) => [row.id, toListing(row)])
    );
    const userById = new Map(userRows.map((row) => [row.id, row]));

    return {
      items: rows.flatMap((row) => {
        const listing = listingById.get(row.listingId);
        if (!listing) {
          return [];
        }
        const role = row.renterId === userId ? "renter" : "lender";
        const counterpartyId = counterpartyIdFor(row, role);
        return [
          toRentalSummary({
            counterparty: counterpartyFrom(
              userById.get(counterpartyId),
              counterpartyId
            ),
            listing,
            meetup: null,
            role,
            row,
          }),
        ];
      }),
      limit: query.limit,
      offset: query.offset,
      total: Number(totals[0]?.value ?? 0),
    };
  }
}

function roleWhere(userId: string, role: ListRentalsQuery["role"]) {
  if (role === "renter") {
    return eq(rentals.renterId, userId);
  }
  if (role === "lender") {
    return eq(rentals.lenderId, userId);
  }
  return or(eq(rentals.renterId, userId), eq(rentals.lenderId, userId));
}
