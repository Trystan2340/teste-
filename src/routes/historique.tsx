import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const HistoryPage = lazyRouteComponent(() => import("@/components/pages/money"), "HistoryPage");

export const Route = createFileRoute("/historique")({
  head: () => ({ meta: [{ title: "Historique — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <HistoryPage />
      </Shell>
    );
  },
});
