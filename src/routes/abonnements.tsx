import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Subscriptions = lazyRouteComponent(
  () => import("@/components/pages/system"),
  "Subscriptions",
);

export const Route = createFileRoute("/abonnements")({
  head: () => ({ meta: [{ title: "Abonnements — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Subscriptions />
      </Shell>
    );
  },
});
