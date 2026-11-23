import AsyncStorage from "@react-native-async-storage/async-storage";

/**
 * Device-local favourites while a guest.
 *
 * One versioned JSON blob under one key, so the shape can evolve without a
 * migration: version mismatches read as empty, and a corrupt read is treated
 * as "nothing favourited" rather than crashing the app on launch.
 */

const KEY = "wearly.favourites";
const VERSION = 1;

interface FavouritesPayload {
  ids: string[];
  version: number;
}

export async function readFavourites(): Promise<string[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY);
    if (raw === null) {
      return [];
    }
    const payload: unknown = JSON.parse(raw);
    const isValid =
      typeof payload === "object" &&
      payload !== null &&
      "version" in payload &&
      payload.version === VERSION &&
      "ids" in payload &&
      Array.isArray(payload.ids) &&
      payload.ids.every((id) => typeof id === "string");
    if (!isValid) {
      return [];
    }
    const { ids } = payload as FavouritesPayload;
    return [...new Set(ids)];
  } catch {
    return [];
  }
}

export async function writeFavourites(ids: readonly string[]): Promise<void> {
  const payload: FavouritesPayload = { ids: [...new Set(ids)], version: VERSION };
  await AsyncStorage.setItem(KEY, JSON.stringify(payload));
}

export async function clearFavourites(): Promise<void> {
  await AsyncStorage.removeItem(KEY);
}
