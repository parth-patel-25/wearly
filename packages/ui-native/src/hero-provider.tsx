import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";

/**
 * The hero transition.
 *
 * Wearly's signature interaction: a product card does not slide to a new screen,
 * it **expands into** it. The card the user tapped is measured on press, and the
 * product page opens by growing out of exactly that rectangle.
 *
 * Why measured geometry rather than a declarative shared-element tag: the
 * measurement is taken on the real card, the reverse transition can read the same
 * frame, and the whole thing behaves identically on web and native. A
 * `sharedTransitionTag` needs both screens mounted at once and gives no control
 * over the reverse path, which is the half users actually notice.
 *
 * The overlay lives in one place — `hero-layer.tsx` — and it is the only
 * absolutely-positioned surface in the product. It is a transient animation
 * layer, not layout.
 */

export interface HeroFrame {
  height: number;
  width: number;
  x: number;
  y: number;
}

export interface HeroState {
  /** What is expanding, and from where. */
  frame: HeroFrame | null;
  /** The content the expanding surface shows while it grows. */
  render: (() => ReactNode) | null;
  /** The product the expansion belongs to, so a deep link can skip it. */
  targetId: string | null;
}

interface HeroApi {
  /** Record the tapped card's frame, then navigate. */
  begin: (targetId: string, frame: HeroFrame, render: () => ReactNode) => void;
  /** Clear once the expansion has finished. */
  end: () => void;
  state: HeroState;
}

const HeroContext = createContext<HeroApi | null>(null);

export function HeroProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<HeroState>({
    frame: null,
    render: null,
    targetId: null,
  });

  const begin = useCallback(
    (targetId: string, frame: HeroFrame, render: () => ReactNode) => {
      setState({ frame, render, targetId });
    },
    []
  );

  const end = useCallback(() => {
    setState({ frame: null, render: null, targetId: null });
  }, []);

  const api = useMemo<HeroApi>(
    () => ({ begin, end, state }),
    [begin, end, state]
  );

  return <HeroContext.Provider value={api}>{children}</HeroContext.Provider>;
}

export function useHero(): HeroApi {
  const api = useContext(HeroContext);
  if (api === null) {
    throw new Error("useHero must be used inside <HeroProvider>");
  }
  return api;
}
