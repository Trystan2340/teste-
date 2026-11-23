import { createFileRoute } from "@tanstack/react-router";

import { PublicSubs } from "@/components/pages/public";

export const Route = createFileRoute("/abonnements-recurrents")({
  head: () => ({ meta: [{ title: "Abonnements — FREEV" }] }),
  component: PublicSubs,
});
