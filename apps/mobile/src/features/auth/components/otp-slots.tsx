import { OTP_LENGTH } from "@features/auth/validations/auth.schema";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

interface OtpSlotsProps {
  invalid?: boolean;
  value: string;
}

export function OtpSlots({ invalid = false, value }: OtpSlotsProps) {
  const activeIndex = Math.min(value.length, OTP_LENGTH - 1);

  return (
    <View className="flex-row justify-center gap-2">
      {(["a", "b", "c", "d", "e", "f"] as const)
        .slice(0, OTP_LENGTH)
        .map((slotId, index) => {
          const filled = index < value.length;
          const active = !invalid && index === activeIndex && !filled;
          const digit = value[index] ?? "";
          let slotClassName = "border-border bg-card";
          if (invalid) {
            slotClassName = "border-destructive";
          } else if (active) {
            slotClassName = "border-primary bg-card";
          }
          let slotText = "";
          if (filled) {
            slotText = digit;
          } else if (active) {
            slotText = " ";
          }

          return (
            <View
              className={`h-12 w-12 items-center justify-center rounded-full border bg-muted ${slotClassName}`}
              key={slotId}
            >
              <Text
                className={filled ? "text-foreground" : "text-muted-foreground"}
                variant="headingSm"
              >
                {slotText}
              </Text>
            </View>
          );
        })}
    </View>
  );
}
