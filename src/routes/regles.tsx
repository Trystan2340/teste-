import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Rules = lazyRouteComponent(() => import("@/components/pages/system"), "Rules");

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
