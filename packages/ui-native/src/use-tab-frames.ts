import { useCallback, useMemo, useState } from "react";
import type { LayoutChangeEvent } from "react-native";

/**
 * Measuring the tab bar.
 *
 * Split out of `./tab-bar` because the bar itself has a line budget and this is
 * the part that grew: sizing the pill from each tab's *content* rather than its
 * slot needs two layout passes per tab instead of one, and neither the icons nor
 * the layout has any interest in how that works.
 *
 * Nothing here knows what a tab is. It reports positions and widths; the bar
 * decides what to do with them.
 */

export type LayoutHandler = (event: LayoutChangeEvent) => void;

/** What a tab reports about itself, from two separate layout passes. */
export interface TabMetrics {
  /** Width of the icon-and-label column, i.e. what the pill should hug. */
  contentWidth: number;
  /** The slot's width in the row. */
  slotWidth: number;
  /** The slot's left edge in the row — `onLayout` is relative to the parent. */
  slotX: number;
}

export interface TabMeasurements<K extends string> {
  metrics: Partial<Record<K, TabMetrics>>;
  /** The icon-and-label column's width. Drives the pill's width. */
  onContentLayoutFor: Record<K, LayoutHandler>;
  /** The tab's slot. Drives the pill's centre. */
  onLayoutFor: Record<K, LayoutHandler>;
}

/**
 * Where every tab sits inside the bar, and what its content measures.
 *
 * Measured, not computed. Five equal `flex-1` slots would *usually* put the pill
 * at `index × width / 5`, but "usually" is doing real work in that sentence: a
 * label in another language can be wider than its slot's minimum, flex
 * distribution is not guaranteed to be uniform once anything is measured in
 * pixels, and a rotation re-lays-out the row. Asking each item where it landed
 * is the only version that stays true at every width and in every language.
 *
 * Two passes, because a tab needs two facts and they live at two levels. The
 * slot's `onLayout` is relative to the row — the space the indicator animates
 * in, so it gives the centre. The content column's own `onLayout` gives the
 * width, and its `x` is deliberately ignored: it is relative to the slot, and
 * mixing the two coordinate spaces is how a pill ends up a tab out of position.
 * The content is centred, so the slot's centre is the content's centre.
 */
export function useTabFrames<K extends string>(keys: readonly K[]) {
  const [metrics, setMetrics] = useState<Partial<Record<K, TabMetrics>>>({});

  const measure = useCallback((tab: K, patch: Partial<TabMetrics>) => {
    setMetrics((previous) => {
      const existing = previous[tab];
      // Layout fires on every parent re-render, rotation and keyboard show.
      // Only a real change is a state update, or the indicator would re-animate
      // forever.
      if (
        existing !== undefined &&
        patch.contentWidth === existing.contentWidth &&
        patch.slotX === existing.slotX &&
        patch.slotWidth === existing.slotWidth
      ) {
        return previous;
      }
      return { ...previous, [tab]: { ...existing, ...patch } };
    });
  }, []);

  // One stable handler per tab per pass, built once. A fresh `onLayout` identity
  // each render re-fires layout each render, and each firing is a potential
  // update.
  const onContentLayoutFor = useMemo(
    () =>
      Object.fromEntries(
        keys.map((tab) => [
          tab,
          ({ nativeEvent }: LayoutChangeEvent) => {
            measure(tab, { contentWidth: nativeEvent.layout.width });
          },
        ])
      ) as Record<K, LayoutHandler>,
    [keys, measure]
  );

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

  return { metrics, onContentLayoutFor, onLayoutFor };
}
