import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const ProSettings = lazyRouteComponent(() => import("@/components/pages/system"), "ProSettings");

export const Route = createFileRoute("/parametres-pro")({
  head: () => ({ meta: [{ title: "Paramètres pro — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <ProSettings />
      </Shell>
    );
  },
});
