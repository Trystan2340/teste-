import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Planner = lazyRouteComponent(() => import("@/components/pages/plan"), "Planner");

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Planner — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Planner />
      </Shell>
    );
  },
});
