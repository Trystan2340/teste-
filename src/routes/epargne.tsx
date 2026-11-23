import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Savings = lazyRouteComponent(() => import("@/components/pages/plan"), "Savings");

export const Route = createFileRoute("/epargne")({
  head: () => ({ meta: [{ title: "Épargne — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Savings />
      </Shell>
    );
  },
});
