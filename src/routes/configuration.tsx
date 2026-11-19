import { createFileRoute } from "@tanstack/react-router";
import { Configure } from "@/components/pages/gate";

export const Route = createFileRoute("/configuration")({
  head: () => ({ meta: [{ title: "Configuration — FREEV" }] }),
  component: Configure,
});
