import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Rules } from "@/components/pages/system";

export const Route = createFileRoute("/regles")({
  head: () => ({ meta: [{ title: "Règles — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Rules />
      </Shell>
    );
  },
});
