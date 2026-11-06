import { Avatar } from "@wearly/ui-native/avatar";
import { BottomSheet } from "@wearly/ui-native/bottom-sheet";
import { Button } from "@wearly/ui-native/button";
import { Text } from "@wearly/ui-native/text";
import { View } from "react-native";

import { useUpdateAvatar } from "../hooks/use-update-avatar";

/**
 * Add, change or remove the profile photo.
 *
 * The sheet owns the picking, pending state and errors; Profile only decides
 * that the sheet is open. Removal is one tap and reversible (the monogram
 * returns; re-uploading restores a photo), so it needs no confirmation step —
 * unlike sign-out, which ends a session. The sheet closes only on a saved
 * change; a dismissed picker or a failed upload leaves it open with the toast
 * carrying the reason.
 */

export interface EditPhotoSheetProps {
  /** Current provider or uploaded photo, when there is one. */
  image: string | null;
  /** Display name, used for the monogram fallback in the preview. */
  name: string | null;
  onClose: () => void;
  open: boolean;
}

export function EditPhotoSheet({
  image,
  name,
  onClose,
  open,
}: EditPhotoSheetProps) {
  const { busyAction, isBusy, pickAndUpload, removeAvatar } = useUpdateAvatar();
  const hasPhoto = typeof image === "string" && image.length > 0;

  const run = async (
    action: () => Promise<"saved" | "cancelled" | "failed">
  ) => {
    const result = await action();
    if (result === "saved") {
      onClose();
    }
  };

  return (
    <BottomSheet
      footer={
        <View className="gap-3">
          <Button
            disabled={isBusy}
            loading={busyAction === "gallery"}
            onPress={() => run(() => pickAndUpload("gallery"))}
            size="lg"
          >
            Choose from gallery
          </Button>
          <Button
            disabled={isBusy}
            icon="camera"
            loading={busyAction === "camera"}
            onPress={() => run(() => pickAndUpload("camera"))}
            size="lg"
            variant="soft"
          >
            Take a photo
          </Button>
          {hasPhoto ? (
            <Button
              disabled={isBusy}
              loading={busyAction === "remove"}
              onPress={() => run(removeAvatar)}
              size="lg"
              variant="ghost"
            >
              Remove photo
            </Button>
          ) : null}
          <Button disabled={isBusy} onPress={onClose} size="sm" variant="ghost">
            Cancel
          </Button>
        </View>
      }
      onClose={onClose}
      open={open}
      title="Profile photo"
    >
      <View className="items-center gap-4 py-2">
        <Avatar name={name ?? undefined} size="xl" src={image ?? undefined} />
        <Text className="text-center" tone="muted-foreground" variant="bodyMd">
          {hasPhoto
            ? "This is how lenders and renters will see you."
            : "Email accounts start without a photo. Add one so lenders and renters recognise you — your name stays visible either way."}
        </Text>
      </View>
    </BottomSheet>
  );
}
