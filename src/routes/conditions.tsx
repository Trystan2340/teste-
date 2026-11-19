import { createFileRoute } from "@tanstack/react-router";
import { Terms } from "@/components/pages/public";

export const Route = createFileRoute("/conditions")({
  head: () => ({ meta: [{ title: "Conditions — FREEV" }] }),
  component: Terms,
});
