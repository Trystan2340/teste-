import { createFileRoute } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { Business } from "@/components/pages/observe";

export const Route = createFileRoute("/business")({
  head: () => ({ meta: [{ title: "Business — FREEV" }] }),
  component: function Page() {
    return (
      <Shell>
        <Business />
      </Shell>
    );
  },
});
