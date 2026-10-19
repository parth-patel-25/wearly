import { SUPPORT_EMAIL } from "@shared/constants/links";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { View } from "react-native";

import { openExternal } from "../lib/open-external";

/**
 * Support information.
 *
 * There is no support destination configured in this build, so this view does
 * not invent one. It states what is true about the prototype and, only when an
 * address is configured through the environment, offers a way to write in.
 */

export interface SupportSheetProps {
  onClose: () => void;
  open: boolean;
}

export function SupportSheet({ onClose, open }: SupportSheetProps) {
  const toast = useToast();

  const emailSupport = async () => {
    if (SUPPORT_EMAIL === null) {
      return;
    }
    const opened = await openExternal(`mailto:${SUPPORT_EMAIL}`);
    if (!opened) {
      toast.show("Could not open your email app", "error");
    }
  };

  return (
    <BottomSheet onClose={onClose} open={open} title="Help & support">
      <Text variant="bodyMd">
        Wearly is an early prototype. Rentals and listings are not live, and
        saved pieces live on this device rather than on your account.
      </Text>
      {SUPPORT_EMAIL === null ? (
        <Text tone="muted-foreground" variant="caption">
          Live support is not connected in this build. Once a support address is
          configured, it appears here.
        </Text>
      ) : (
        <View className="w-full">
          <Button onPress={emailSupport} size="lg" variant="soft">
            Email support
          </Button>
        </View>
      )}
    </BottomSheet>
  );
}
