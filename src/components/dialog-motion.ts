import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { useFreev } from "@/lib/freev/store";

/** How long the sheet's exit animation lasts — keep in sync with styles.css. */
const EXIT_MS = 180;

/** Set by <Modal>; every dialog reads it to close through the animation. */
export const DialogCloseContext = createContext<(() => void) | null>(null);

/** Closes the surrounding dialog, with its exit animation when there is one. */
export function useDialogClose() {
  const ctx = useContext(DialogCloseContext);
  const open = useFreev((s) => s.open);
  return ctx ?? (() => open(null));
}

/** Owns the closing state of a sheet. */
export function useSheetClose() {
  const open = useFreev((s) => s.open);
  const [closing, setClosing] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current);
    },
    [],
  );

  const close = useCallback(() => {
    if (closing) return;
    setClosing(true);
    timer.current = window.setTimeout(() => {
      open(null);
      setClosing(false);
    }, EXIT_MS);
  }, [closing, open]);

  return { close, closing };
}
