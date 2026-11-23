import { createFileRoute, lazyRouteComponent } from "@tanstack/react-router";

const Configure = lazyRouteComponent(() => import("@/components/pages/gate"), "Configure");

export const Route = createFileRoute("/configuration")({
  head: () => ({ meta: [{ title: "Configuration — FREEV" }] }),
  component: Configure,
});
