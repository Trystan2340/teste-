import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";
import { Shell } from "@/components/shell";

const Account = lazyRouteComponent(() => import("@/components/pages/system"), "Account");

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
