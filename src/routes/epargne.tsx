import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Savings } from "@/components/pages/plan";

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
