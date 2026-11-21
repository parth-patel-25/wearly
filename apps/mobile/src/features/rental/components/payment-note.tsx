import type { RentalPayment } from "@wearly/shared/api/types";
import { PAYMENT_MODES, PAYMENT_STATUSES } from "@wearly/shared/enums";
import { Card } from "@wearly/ui-native/card";
import { Icon } from "@wearly/ui-native/icon";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

/**
 * Payment honesty.
 *
 * While the provider is a placeholder the app must not say "Paid", "Held" or
 * "Protected". The state is read from the API, so connecting a real provider
 * changes this copy without changing a screen.
 */
export function PaymentNote({ payment }: { payment: RentalPayment }) {
  const { copy, tone } = paymentCopy(payment);

  return (
    <Card className="flex-row items-start gap-3 p-4" variant="muted">
      <View className="size-9 items-center justify-center rounded-pill bg-card">
        <Icon
          name={tone === "warning" ? "shield" : "lock"}
          size="sm"
          tone="muted-foreground"
        />
      </View>
      <Text className="flex-1" tone="muted-foreground" variant="bodySm">
        {copy}
      </Text>
    </Card>
  );
}

function paymentCopy(payment: RentalPayment): {
  copy: string;
  tone: "normal" | "warning";
} {
  if (payment.mode === PAYMENT_MODES.PLACEHOLDER) {
    return {
      copy: "Payment protection is not connected in this build. No money has been taken or reserved. When a provider is connected, the amount is authorized on request and captured only after you confirm handover.",
      tone: "warning",
    };
  }

  switch (payment.status) {
    case PAYMENT_STATUSES.AUTHORIZED:
      return {
        copy: "The amount is authorized. It is captured only when the renter confirms handover.",
        tone: "normal",
      };
    case PAYMENT_STATUSES.CAPTURED:
      return { copy: "Payment was captured at handover.", tone: "normal" };
    case PAYMENT_STATUSES.VOIDED:
      return {
        copy: "The payment hold was released. Nothing was charged.",
        tone: "normal",
      };
    case PAYMENT_STATUSES.FAILED:
      return {
        copy: "Payment did not complete. The rental has not started and nothing was charged.",
        tone: "warning",
      };
    case PAYMENT_STATUSES.REFUNDED:
      return { copy: "The captured amount was refunded.", tone: "normal" };
    default:
      return {
        copy: "No payment has been taken for this rental yet.",
        tone: "normal",
      };
  }
}
