import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Analytics } from "@/components/pages/observe";

export const Route = createFileRoute("/analytique")({
  head: () => ({ meta: [{ title: "Analytique — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Analytics />
      </Shell>
    );
  },
});
