import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/**
 * Measuring the tab bar.
 *
 * Split out of `./tab-bar` so the bar reads as layout rather than bookkeeping.
 * Nothing here knows what a tab is: it reports where each slot landed, and the
 * bar decides what to do with it.
 *
 * One pass per tab. An earlier version took a second — the icon-and-label column's
 * own width, to let the indicator hug the label — which meant every tab paid two
 * layout passes to be measured, and reintroduced the hazard of reading an `x` from
 * one coordinate space and a width from another. The active circle is sized from its
 * own constant rather than from a measurement at all; see the note in `./tab-bar`.
 */

export type LayoutHandler = (event: LayoutChangeEvent) => void;

/** What a tab reports about itself. */
export interface TabMetrics {
  /** The slot's width in the row. */
  slotWidth: number;
  /** The slot's left edge in the row — `onLayout` is relative to the parent. */
  slotX: number;
}

export interface TabMeasurements<K extends string> {
  metrics: Partial<Record<K, TabMetrics>>;
  /** The tab's slot. Drives the active circle's centre. */
  onLayoutFor: Record<K, LayoutHandler>;
}

/**
 * Where every tab sits inside the bar.
 *
 * Measured, not computed. Four equal `flex-1` slots would *usually* put the
 * circle's centre at `index × width / 4`, but "usually" is doing real work in that
 * sentence: flex distribution is not guaranteed to stay uniform once anything is
 * measured in pixels, a label in another language can be wider than its slot's
 * minimum, and a rotation re-lays-out the row. Asking each item where it landed is
 * the only version that stays true at every width and in every language.
 *
 * `onLayout` is relative to the row — which is exactly the coordinate space the
 * circle slides in — so a single handler per tab is all this needs.
 */
export function useTabFrames<K extends string>(keys: readonly K[]) {
  const [metrics, setMetrics] = useState<Partial<Record<K, TabMetrics>>>({});

  const measure = useCallback((tab: K, patch: Partial<TabMetrics>) => {
    setMetrics((previous) => {
      const existing = previous[tab];
      // Layout fires on every parent re-render, rotation and keyboard show. Only a
      // real change is a state update, or the indicator would re-animate forever.
      if (
        existing !== undefined &&
        patch.slotX === existing.slotX &&
        patch.slotWidth === existing.slotWidth
      ) {
        return previous;
      }
      return { ...previous, [tab]: { ...existing, ...patch } };
    });
  }, []);

  // One stable handler per tab, built once. A fresh `onLayout` identity each render
  // re-fires layout each render, and each firing is a potential update.
  const onLayoutFor = useMemo(
    () =>
      Object.fromEntries(
        keys.map((tab) => [
          tab,
          ({ nativeEvent }: LayoutChangeEvent) => {
            const { width, x } = nativeEvent.layout;
            measure(tab, { slotWidth: width, slotX: x });
          },
        ])
      ) as Record<K, LayoutHandler>,
    [keys, measure]
  );

  return { metrics, onLayoutFor };
}
