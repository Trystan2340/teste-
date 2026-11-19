import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ProSettings } from "@/components/pages/system";

export const Route = createFileRoute("/parametres-pro")({
  head: () => ({ meta: [{ title: "Paramètres pro — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <ProSettings />
      </Shell>
    );
  },
});
