import { createFileRoute } from "@tanstack/react-router";
import { Signup } from "@/components/pages/gate";

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [{ title: "Inscription — FREEV" }] }),
  component: Signup,
});
