import { kOnlineManager, type OnlineManager } from "better-auth/client";
import { useNetworkState } from "expo-network";
import { useEffect } from "react";

/**
 * Connectivity for Better Auth's session refresh.
 *
 * Better Auth gates every focus refetch behind its own online manager, and
 * that manager seeds itself from `navigator.onLine`. React Native ships
 * `navigator` as `{ product: "ReactNative" }` — there is no `onLine` — so
 * `isOnline` starts out `undefined`, `shouldRefetch()` is falsy, and every
 * focus refetch is dropped before it reaches the network. That is why a user
 * deleted from the admin panel still looked signed in on Profile: the focus
 * event fired, the refresh manager caught it, then bailed out.
 *
 * Expo already has the real answer, so hand it over. `expo-network` reports
 * nothing on its first render, which is treated as online — attempting a
 * refetch that fails is better than refusing one that is needed.
 */
export function useAuthOnlineState(): void {
  const { isConnected } = useNetworkState();

  useEffect(() => {
    const online = isConnected ?? true;
    const manager = (globalThis as unknown as OnlineGlobals)[kOnlineManager];
    if (manager && manager.isOnline !== online) {
      manager.setOnline(online);
    }
  }, [isConnected]);
}

interface OnlineGlobals {
  [kOnlineManager]?: OnlineManager;
}
