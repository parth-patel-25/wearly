import {
  Accuracy,
  getCurrentPositionAsync,
  hasServicesEnabledAsync,
  requestForegroundPermissionsAsync,
} from "expo-location";
import { useCallback, useState } from "react";

/**
 * Opt-in, one-shot foreground location.
 *
 * Nothing runs on mount. The user taps a button on Discover, the system prompt
 * appears, and only then do we ask for a single fix. There is no watch, no
 * background permission and no stored coordinate — the value lives in this
 * screen's state and disappears with it.
 */

export type NearbyStatus =
  | "idle"
  | "requesting"
  | "granted"
  | "denied"
  | "unavailable";

export interface NearbyCoordinates {
  latitude: number;
  longitude: number;
}

export interface NearbyLocation {
  /** Forgets the fix and brings the explainer back. */
  clear: () => void;
  coords: NearbyCoordinates | null;
  /** Hides the explainer for this session after "Not now". */
  dismiss: () => void;
  dismissed: boolean;
  request: () => Promise<NearbyCoordinates | null>;
  status: NearbyStatus;
}

export function useNearbyLocation(): NearbyLocation {
  const [coords, setCoords] = useState<NearbyCoordinates | null>(null);
  const [status, setStatus] = useState<NearbyStatus>("idle");
  const [dismissed, setDismissed] = useState(false);

  const request = useCallback(async (): Promise<NearbyCoordinates | null> => {
    setStatus("requesting");
    try {
      const services = await hasServicesEnabledAsync();
      if (!services) {
        setStatus("unavailable");
        return null;
      }

      const permission = await requestForegroundPermissionsAsync();
      if (!permission.granted) {
        setStatus("denied");
        return null;
      }

      const position = await getCurrentPositionAsync({
        accuracy: Accuracy.Low,
      });

      const next = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
      setCoords(next);
      setStatus("granted");
      return next;
    } catch {
      // A denied or failed fix is never an error screen: the whole grid still
      // works by area and text search.
      setStatus("unavailable");
      return null;
    }
  }, []);

  const dismiss = useCallback(() => setDismissed(true), []);

  const clear = useCallback(() => {
    setCoords(null);
    setStatus("idle");
    setDismissed(false);
  }, []);

  return { clear, coords, dismiss, dismissed, request, status };
}
