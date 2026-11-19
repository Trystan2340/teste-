import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const MonthCheck = lazyRouteComponent(() => import("@/components/pages/system"), "MonthCheck");

export const Route = createFileRoute("/controle")({
  head: () => ({ meta: [{ title: "Contrôle mensuel — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <MonthCheck />
      </Shell>
    );
  },
});
