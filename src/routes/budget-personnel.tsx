import { createFileRoute } from "@tanstack/react-router";
import { PublicBudget } from "@/components/pages/public";

export const Route = createFileRoute("/budget-personnel")({
  head: () => ({ meta: [{ title: "Budget personnel — FREEV" }] }),
  component: PublicBudget,
});
