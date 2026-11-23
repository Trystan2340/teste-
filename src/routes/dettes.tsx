import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Debts = lazyRouteComponent(() => import("@/components/pages/plan"), "Debts");

export const Route = createFileRoute("/dettes")({
  head: () => ({ meta: [{ title: "Dettes — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Debts />
      </Shell>
    );
  },
});
