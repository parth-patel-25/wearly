import { APP_NAME, APP_VERSION } from "@shared/constants/app-info";
import { PRIVACY_URL, TERMS_URL } from "@shared/constants/links";
import { Card } from "@wearly/ui-native/card";
import { Text } from "@wearly/ui-native/text";
import { useToast } from "@wearly/ui-native/toast";
import { useState } from "react";
import { View } from "react-native";

import { openExternal } from "../lib/open-external";
import { ProfileRow } from "./profile-row";
import { SupportSheet } from "./support-sheet";

/**
 * Help, legal and build information.
 *
 * Legal rows render only when a real URL is configured, because the product
 * spec forbids presenting a placeholder as an official policy. When the links
 * are missing, the section says so instead of hiding the gap. The version comes
 * from the installed Expo config, so it is never a second copy to maintain.
 */

export function ProfileAbout() {
  const [supportOpen, setSupportOpen] = useState(false);
  const toast = useToast();
  // Aliased locally so the truthiness check narrows inside the press handlers.
  // An imported binding is a live reference and TypeScript will not carry the
  // narrowing into a closure over it.
  const privacyUrl = PRIVACY_URL;
  const termsUrl = TERMS_URL;

  const openLink = async (url: string) => {
    const opened = await openExternal(url);
    if (!opened) {
      toast.show("Could not open that link", "error");
    }
  };

  const hasBothPolicies = privacyUrl !== null && termsUrl !== null;

  return (
    <View className="gap-3">
      <Text variant="headingSm">About</Text>

      <Card className="overflow-hidden p-0">
        <ProfileRow
          icon="info"
          label="Help & support"
          onPress={() => setSupportOpen(true)}
        />
        {privacyUrl === null ? null : (
          <ProfileRow
            icon="shield"
            label="Privacy policy"
            onPress={() => openLink(privacyUrl)}
          />
        )}
        {termsUrl === null ? null : (
          <ProfileRow
            icon="shield"
            label="Terms of service"
            onPress={() => openLink(termsUrl)}
          />
        )}
      </Card>

      {hasBothPolicies ? null : (
        <Text tone="muted-foreground" variant="caption">
          Privacy policy and terms are not published yet. They will appear here
          once their links are configured.
        </Text>
      )}

      <Text tone="muted-foreground" variant="caption">
        {APP_VERSION === null
          ? APP_NAME
          : `${APP_NAME} · Version ${APP_VERSION}`}
      </Text>

      <SupportSheet onClose={() => setSupportOpen(false)} open={supportOpen} />
    </View>
  );
}
