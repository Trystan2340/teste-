import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Scanner = lazyRouteComponent(() => import("@/components/pages/system"), "Scanner");

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "Scanner — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Scanner />
      </Shell>
    );
  },
});
