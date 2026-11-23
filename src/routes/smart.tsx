import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Smart = lazyRouteComponent(() => import("@/components/pages/plan"), "Smart");

export const Route = createFileRoute("/smart")({
  head: () => ({ meta: [{ title: "Smart — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Smart />
      </Shell>
    );
  },
});
