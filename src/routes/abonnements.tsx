import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Subscriptions } from "@/components/pages/system";

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
