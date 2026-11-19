import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { HistoryPage } from "@/components/pages/money";

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
