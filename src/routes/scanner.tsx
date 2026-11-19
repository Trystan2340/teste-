import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Scanner } from "@/components/pages/system";

export const Route = createFileRoute("/scanner")({
  head: () => ({ meta: [{ title: "Scanner — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Scanner />
      </Shell>
    );
  },
});
