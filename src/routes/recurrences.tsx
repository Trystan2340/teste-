import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Recurring } from "@/components/pages/money";

export const Route = createFileRoute("/recurrences")({
  head: () => ({ meta: [{ title: "Récurrences — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Recurring />
      </Shell>
    );
  },
});
