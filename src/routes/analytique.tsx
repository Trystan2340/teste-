import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Analytics = lazyRouteComponent(() => import("@/components/pages/observe"), "Analytics");

export const Route = createFileRoute("/analytique")({
  head: () => ({ meta: [{ title: "Analytique — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Analytics />
      </Shell>
    );
  },
});
