import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useFreev } from "@/lib/freev/store";

/**
 * Toast-style confirmation for every mutating action, with a working "Annuler".
 *
 * The previous version fired a plain toast — informative, not reversible. This
 * one turns the same moment into a real safety net: the store keeps the
 * snapshot, so undo restores the exact prior state.
 */
export function useUndoableToast() {
  const lastChange = useFreev((s) => s.lastChange);
  const undo = useFreev((s) => s.undo);
  const [seen, setSeen] = useState<string | null>(null);

  useEffect(() => {
    if (!lastChange || lastChange === seen) return;
    setSeen(lastChange);
    const id = toast(lastChange, {
      description: "Vous pouvez revenir en arrière.",
      duration: 6000,
      action: {
        label: "Annuler",
        onClick: () => {
          undo();
          toast.dismiss(id);
          toast("Modification annulée", { duration: 2500 });
        },
      },
    });
  }, [lastChange, seen, undo]);
}

/** Full undo history, newest first, for the settings screen. */
export function useUndoState() {
  const lastChange = useFreev((s) => s.lastChange);
  const undo = useFreev((s) => s.undo);
  return { lastChange, undo };
}
