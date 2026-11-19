import { createFileRoute } from "@tanstack/react-router";
import { Privacy } from "@/components/pages/public";

export const Route = createFileRoute("/confidentialite")({
  head: () => ({ meta: [{ title: "Confidentialité — FREEV" }] }),
  component: Privacy,
});
