import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Report } from "@/components/pages/observe";

export const Route = createFileRoute("/rapport")({
  head: () => ({ meta: [{ title: "Rapport — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Report />
      </Shell>
    );
  },
});
