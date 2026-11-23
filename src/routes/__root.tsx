import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";
// The two latin faces behind nearly every glyph: preload them so the first
// paint is not waiting on a stylesheet round-trip to discover them.
import frauncesUrl from "@fontsource-variable/fraunces/files/fraunces-latin-opsz-normal.woff2?url";
import outfitUrl from "@fontsource-variable/outfit/files/outfit-latin-wght-normal.woff2?url";

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "FREEV" },
      { name: "description", content: "FREEV — livre de comptes personnel et professionnel." },
      { name: "theme-color", content: "#12110f" },
    ],
    links: [
      { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
      { rel: "stylesheet", href: appCss },
      // The two families are the whole identity: fetch the stylesheet (which
      // now carries their @font-face rules) as early as possible.
      { rel: "preload", href: appCss, as: "style" },
      { rel: "preload", href: outfitUrl, as: "font", type: "font/woff2", crossOrigin: "anonymous" },
      {
        rel: "preload",
        href: frauncesUrl,
        as: "font",
        type: "font/woff2",
        crossOrigin: "anonymous",
      },
      { rel: "manifest", href: "/__grok/manifest.webmanifest" },
      { rel: "apple-touch-icon", href: "/__grok/icon-180.png" },
    ],
  }),
  component: () => (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body>
        <script
          dangerouslySetInnerHTML={{
            __html:
              "try{var t=JSON.parse(localStorage.getItem('freev')||'{}');var th=t.state&&t.state.theme;var d=window.matchMedia('(prefers-color-scheme: dark)').matches;var r=th==='system'?(d?'ink':'paper'):(th||'ink');document.documentElement.dataset.theme=r;}catch(e){}",
          }}
        />
        <PreviewHostBridge />
        <AuthProvider>
          <Outlet />
          <Toaster
            position="bottom-right"
            gap={10}
            offset={18}
            toastOptions={{
              // Match the app: floating card, soft radius, theme tokens.
              style: {
                background: "var(--card)",
                color: "var(--ink)",
                border: "1px solid var(--rule)",
                borderRadius: "1rem",
                boxShadow: "var(--float)",
                fontFamily: "var(--font-sans)",
              },
              className: "freev-toast",
            }}
          />
        </AuthProvider>
        <Scripts />
      </body>
    </html>
  ),
});
