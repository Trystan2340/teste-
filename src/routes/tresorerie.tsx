import { createFileRoute } from "@tanstack/react-router";

import { PublicCash } from "@/components/pages/public";

export const Route = createFileRoute("/tresorerie")({
  head: () => ({ meta: [{ title: "Trésorerie — FREEV" }] }),
  component: PublicCash,
});
