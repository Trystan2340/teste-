import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const Signup = lazyRouteComponent(() => import("@/components/pages/gate"), "Signup");

export const Route = createFileRoute("/inscription")({
  head: () => ({ meta: [{ title: "Inscription — FREEV" }] }),
  component: Signup,
});
