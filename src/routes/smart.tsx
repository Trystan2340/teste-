import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Smart } from "@/components/pages/plan";

export const Route = createFileRoute("/smart")({
  head: () => ({ meta: [{ title: "Smart — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Smart />
      </Shell>
    );
  },
});
