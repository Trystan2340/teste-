import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Debts } from "@/components/pages/plan";

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
