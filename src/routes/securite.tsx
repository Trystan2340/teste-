import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Security = lazyRouteComponent(() => import("@/components/pages/system"), "Security");

export const Route = createFileRoute("/securite")({
  head: () => ({ meta: [{ title: "Sécurité — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Security />
      </Shell>
    );
  },
});
