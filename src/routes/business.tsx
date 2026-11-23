import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Business = lazyRouteComponent(() => import("@/components/pages/observe"), "Business");

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [{ title: "Business — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Business />
      </Shell>
    );
  },
});
