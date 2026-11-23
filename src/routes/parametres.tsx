import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Settings = lazyRouteComponent(() => import("@/components/pages/system"), "Settings");

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
