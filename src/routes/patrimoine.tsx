import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Wealth = lazyRouteComponent(() => import("@/components/pages/system"), "Wealth");

export const Route = createFileRoute("/patrimoine")({
  head: () => ({ meta: [{ title: "Patrimoine — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Wealth />
      </Shell>
    );
  },
});
