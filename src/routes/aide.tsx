import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Help } from "@/components/pages/system";

export const Route = createFileRoute("/aide")({
  head: () => ({ meta: [{ title: "Aide — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Help />
      </Shell>
    );
  },
});
