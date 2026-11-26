import type { ToastTone } from "@wearly/ui-native/toast";

/**
 * Favourites confirmation copy.
 *
 * Short, warm and truthful: the account line promises persistence, the guest
 * line says exactly where the save lives and how to carry it across devices.
 * No exclamation marks and no hype — a save is a quiet, kept promise.
 */
export const FAVOURITES_COPY = {
  failed: "Could not update saved pieces",
  removed: "Removed from your saved pieces",
  savedOnDevice: "Saved on this device — sign in to keep it with you",
  savedToAccount: "Saved — it'll be waiting in your profile",
} as const;

type ShowToast = (text: string, tone?: ToastTone) => void;

/**
 * One confirmation per completed toggle. Saving is the moment worth marking;
 * removing gets the quieter information tone, and the account line only
 * promises persistence when there really is an account behind it.
 *
 * `nowSaved` is the state *after* the toggle, never the state before it.
 */
export function showFavouriteToast(
  show: ShowToast,
  nowSaved: boolean,
  source: "account" | "device"
): void {
  if (!nowSaved) {
    show(FAVOURITES_COPY.removed, "info");
    return;
  }
  show(
    source === "account"
      ? FAVOURITES_COPY.savedToAccount
      : FAVOURITES_COPY.savedOnDevice,
    "success"
  );
}
