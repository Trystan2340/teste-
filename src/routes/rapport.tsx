import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Report = lazyRouteComponent(() => import("@/components/pages/observe"), "Report");

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
