import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Help = lazyRouteComponent(() => import("@/components/pages/system"), "Help");

export const Route = createFileRoute("/aide")({
  head: () => ({ meta: [{ title: "Aide — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Help />
      </Shell>
    );
  },
});
