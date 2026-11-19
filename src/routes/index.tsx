import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Dashboard } from "@/components/pages/observe";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Tableau de bord — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Dashboard />
      </Shell>
    );
  },
});
