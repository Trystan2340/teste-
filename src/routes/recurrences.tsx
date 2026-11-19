import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Recurring = lazyRouteComponent(() => import("@/components/pages/money"), "Recurring");

export const Route = createFileRoute("/recurrences")({
  head: () => ({ meta: [{ title: "Récurrences — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Recurring />
      </Shell>
    );
  },
});
