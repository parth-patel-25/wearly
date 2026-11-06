import { useSession } from "@core/providers/session-provider";
import { createLogger } from "@shared/lib/logger";
import { uploadImage } from "@shared/lib/upload-image";
import { STORAGE_FOLDERS } from "@wearly/shared/enums";
import { useToast } from "@wearly/ui-native/toast";
import { launchCameraAsync, launchImageLibraryAsync } from "expo-image-picker";
import { useCallback, useState } from "react";
import { authClient } from "@/lib/auth-client";

const logger = createLogger("ProfileAvatar");

/** Which control started the pending work — only one runs at a time. */
export type AvatarAction = "gallery" | "camera" | "remove" | null;

/** Outcome of an attempt — the sheet closes on `saved` only. */
export type AvatarResult = "saved" | "cancelled" | "failed";

const PICKER_OPTIONS = {
  /** Square crop: the photo is rendered inside a circle everywhere. */
  allowsEditing: true,
  aspect: [1, 1] as [number, number],
  mediaTypes: "images" as const,
  quality: 0.9,
};

/**
 * Add, replace or remove the signed-in account's photo.
 *
 * Email+password accounts start without one, so the monogram is the honest
 * default rather than a missing image. Anyone signed in may set their own —
 * OAuth photos included. The binary goes to the shared bucket under
 * `avatars/<userId>/` through the same signed-URL pipeline as listing photos;
 * the account record then stores only the public URL. After every write the
 * Better Auth session is re-fetched, so Home, Profile and any future surface
 * read the new photo from one source. Removing sets `image` back to `null`,
 * which returns the monogram.
 */
export function useUpdateAvatar() {
  const toast = useToast();
  const { refreshSession } = useSession();
  const [busyAction, setBusyAction] = useState<AvatarAction>(null);

  const persistImage = useCallback(
    async (
      image: string | null,
      successMessage: string
    ): Promise<AvatarResult> => {
      const { error } = await authClient.updateUser({ image });
      if (error) {
        logger.error("updateUser failed", error);
        toast.show(error.message ?? "Could not update your photo", "error");
        return "failed";
      }
      await refreshSession();
      toast.show(successMessage, "success");
      return "saved";
    },
    [refreshSession, toast]
  );

  const pickAndUpload = useCallback(
    async (source: "gallery" | "camera"): Promise<AvatarResult> => {
      setBusyAction(source);
      try {
        const res =
          source === "camera"
            ? await launchCameraAsync(PICKER_OPTIONS)
            : await launchImageLibraryAsync(PICKER_OPTIONS);
        const asset = res.canceled ? undefined : res.assets?.[0];
        if (!asset) {
          // Cancelled is not a failure — leave quietly.
          return "cancelled";
        }
        const uploaded = await uploadImage(asset, STORAGE_FOLDERS.AVATARS);
        return await persistImage(uploaded.publicUrl, "Profile photo updated");
      } catch (error) {
        logger.error("Could not set profile photo", error);
        toast.show("Could not upload your photo. Try again.", "error");
        return "failed";
      } finally {
        setBusyAction(null);
      }
    },
    [persistImage, toast]
  );

  const removeAvatar = useCallback(async (): Promise<AvatarResult> => {
    setBusyAction("remove");
    try {
      return await persistImage(null, "Profile photo removed");
    } catch (error) {
      logger.error("Could not remove profile photo", error);
      toast.show("Could not remove your photo. Try again.", "error");
      return "failed";
    } finally {
      setBusyAction(null);
    }
  }, [persistImage, toast]);

  return {
    busyAction,
    isBusy: busyAction !== null,
    pickAndUpload,
    removeAvatar,
  };
}
