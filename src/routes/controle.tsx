import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { MonthCheck } from "@/components/pages/system";

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
