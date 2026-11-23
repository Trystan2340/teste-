import { createFileRoute } from "@tanstack/react-router";

import { PublicSpend } from "@/components/pages/public";

export const Route = createFileRoute("/suivi-depenses")({
  head: () => ({ meta: [{ title: "Suivi des dépenses — FREEV" }] }),
  component: PublicSpend,
});
