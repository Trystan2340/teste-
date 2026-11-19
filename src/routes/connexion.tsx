import { createFileRoute } from "@tanstack/react-router";
import { Login } from "@/components/pages/gate";

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [{ title: "Connexion — FREEV" }] }),
  component: Login,
});
