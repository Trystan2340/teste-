import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Security } from "@/components/pages/system";

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
