import { formatDate } from "@shared/lib/format-date";
import type { RentalSummary } from "@wearly/shared/api/types";
import { Panel } from "@wearly/ui-native/card";
import { KeyValueRow, PriceRow } from "@wearly/ui-native/status";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/** Dates and money, with the rental total the server snapshotted. */
export function RentalPricePanel({ rental }: { rental: RentalSummary }) {
  return (
    <Panel title="Dates and total">
      <KeyValueRow
        label="Requested"
        value={`${formatDate(rental.startDate)} → ${formatDate(rental.endDate)}`}
      />
      {rental.returnDueAt ? (
        <KeyValueRow label="Return by" value={formatDate(rental.returnDueAt)} />
      ) : null}
      <PriceRow
        hint={`${rental.days} ${rental.days === 1 ? "day" : "days"} · cleaning included`}
        label="Rental total"
        value={`₹${rental.totalRupees.toLocaleString("en-IN")}`}
      />
      <View className="gap-1">
        <Text tone="muted-foreground" variant="caption">
          No deposit is held in this build. The rental total is fixed when the
          request is sent.
        </Text>
      </View>
    </Panel>
  );
}
