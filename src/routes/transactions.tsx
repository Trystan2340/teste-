import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Transactions } from "@/components/pages/money";

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
