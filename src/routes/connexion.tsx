import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const Login = lazyRouteComponent(() => import("@/components/pages/gate"), "Login");

export const Route = createFileRoute("/connexion")({
  head: () => ({ meta: [{ title: "Connexion — FREEV" }] }),
  component: Login,
});
