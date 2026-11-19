import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Account } from "@/components/pages/system";

export const Route = createFileRoute("/compte")({
  head: () => ({ meta: [{ title: "Mon compte — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Account />
      </Shell>
    );
  },
});
