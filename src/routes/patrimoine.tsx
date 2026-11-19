import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Wealth } from "@/components/pages/system";

export const Route = createFileRoute("/patrimoine")({
  head: () => ({ meta: [{ title: "Patrimoine — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Wealth />
      </Shell>
    );
  },
});
