import { createRouter } from "@tanstack/react-router";
import { AppErrorComponent } from "@/lib/error-component";
import { previewPathRewrite } from "@/lib/preview-path-prefix";
import { routeTree } from "./routeTree.gen";

export function getRouter() {
  return createRouter({
    routeTree,
    rewrite: previewPathRewrite(),
    defaultErrorComponent: AppErrorComponent,
    // Native cross-fade between routes (see ::view-transition-* in styles.css).
    // Browsers without support simply navigate as before.
    defaultViewTransition: true,
    scrollRestoration: true,
  });
}
