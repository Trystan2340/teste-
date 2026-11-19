import { toast } from "sonner";
import { useFreev } from "@/lib/freev/store";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  undoLabel?: string;
};

/**
 * Two-step delete: an explicit, named confirmation first, then a real undo
 * window. The store already keeps the snapshot, so nothing is lost if the
 * click was a mistake.
 */
export function useConfirmAction() {
  const undo = useFreev((s) => s.undo);

  return (options: ConfirmOptions, run: () => void) => {
    const id = toast(options.title, {
      description: options.description ?? "Cette action peut être annulée juste après.",
      duration: 8000,
      action: {
        label: options.confirmLabel ?? "Supprimer",
        onClick: () => {
          run();
          toast.dismiss(id);
          toast(`${options.title.replace(/ ?\?$/, "")} — fait`, {
            description: "Vous pouvez encore revenir en arrière.",
            duration: 6000,
            action: {
              label: options.undoLabel ?? "Annuler",
              onClick: () => {
                undo();
                toast("Suppression annulée", { duration: 2500 });
              },
            },
          });
        },
      },
      cancel: {
        label: "Garder",
        onClick: () => toast.dismiss(id),
      },
    });
  };
}
