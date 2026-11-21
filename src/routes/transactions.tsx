import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Transactions = lazyRouteComponent(() => import("@/components/pages/money"), "Transactions");

export const Route = createFileRoute("/transactions")({
  head: () => ({ meta: [{ title: "Transactions — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Transactions />
      </Shell>
    );
  },
});
