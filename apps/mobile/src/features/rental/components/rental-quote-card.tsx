import { formatRupees } from "@shared/data/catalogue";
import type { RentalQuote } from "@wearly/shared/rentals/pricing";
import { Card } from "@wearly/ui-native/card";
import { PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";

interface RentalQuoteCardProps {
  days: number | null;
  quote: RentalQuote | null;
}

/**
 * The running total before the request.
 *
 * No deposit and no delivery line: this build is in-person only, and a line that
 * says zero invites the question of whether it used to cost something.
 */
export function RentalQuoteCard({ days, quote }: RentalQuoteCardProps) {
  const empty = days === null || quote === null;

  return (
    <Card className="gap-2 p-5">
      <PriceRow
        hint={
          empty
            ? "Choose your dates"
            : `${days} ${days === 1 ? "day" : "days"} at ${formatRupees(quote.pricePerDayRupees)}`
        }
        label="Rental"
        value={empty ? "—" : formatRupees(quote.rentalAmountRupees)}
      />
      <PriceRow
        emphasis="muted"
        hint="Included in the price"
        label="Cleaning"
        value={empty ? "—" : formatRupees(quote.cleaningFeeRupees)}
      />
      <PriceRow
        emphasis="total"
        label="Total"
        value={empty ? "—" : formatRupees(quote.totalRupees)}
      />
      <Text tone="muted-foreground" variant="caption">
        No deposit and no delivery fee. You and the lender meet in person.
      </Text>
    </Card>
  );
}
