import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Settings } from "@/components/pages/system";

export const Route = createFileRoute("/parametres")({
  head: () => ({ meta: [{ title: "Paramètres — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Settings />
      </Shell>
    );
  },
});
