import type { ReactNode } from "react";
import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

import type { ToastMessage, ToastTone } from "./toast-view";
import { ToastView } from "./toast-view";

/**
 * Toasts.
 *
 * A small, honest notification system: a queue, a visible region, and an error
 * path that always says what went wrong. Validation failures are surfaced here
 * as well as inline on the field, because a field error alone is easy to miss.
 *
 * The provider owns *which* message is up; the surface owns *how* it leaves.
 * `dismiss` asks the surface to close and only drops the message once its exit
 * animation reports back, so a dismissal is never a pop. A `show` while one is
 * already up swaps the two directly — the new message's clock starts fresh, and
 * the outgoing surface is replaced rather than left to overlap it.
 */

export type { ToastMessage, ToastTone } from "./toast-view";

interface ToastApi {
  dismiss: () => void;
  show: (text: string, tone?: ToastTone) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

/** Mount once, near the root. Renders whatever is currently up. */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [message, setMessage] = useState<ToastMessage | null>(null);
  const nextId = useRef(0);
  const closeRef = useRef<(() => void) | null>(null);

  const show = useCallback((text: string, tone: ToastTone = "info") => {
    nextId.current += 1;
    setMessage({ id: nextId.current, text, tone });
  }, []);

  const dismiss = useCallback(() => {
    closeRef.current?.();
  }, []);

  const handleDismissed = useCallback(() => {
    closeRef.current = null;
    setMessage(null);
  }, []);

  const api = useMemo<ToastApi>(() => ({ dismiss, show }), [dismiss, show]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      {message ? (
        <ToastView
          closeRef={closeRef}
          key={message.id}
          message={message}
          onDismissed={handleDismissed}
        />
      ) : null}
    </ToastContext.Provider>
  );
}

/** The one way a screen raises a message. Throws outside a provider. */
export function useToast(): ToastApi {
  const api = useContext(ToastContext);
  if (api === null) {
    throw new Error("useToast must be used inside <ToastProvider>");
  }
  return api;
}
