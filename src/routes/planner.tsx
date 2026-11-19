import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Planner } from "@/components/pages/plan";

export const Route = createFileRoute("/planner")({
  head: () => ({ meta: [{ title: "Planner — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Planner />
      </Shell>
    );
  },
});
