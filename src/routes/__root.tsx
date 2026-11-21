import { createRootRoute, HeadContent, Outlet, Scripts } from "@tanstack/react-router";
import { Toaster } from "sonner";
import { AuthProvider } from "@/lib/auth/provider";
import { PreviewHostBridge } from "@/components/preview-host-bridge";
import appCss from "../styles.css?url";

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
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      // The two families are the whole identity: fetch the CSS early, and the
      // font files by the time the first paint asks for them.
      { rel: "preload", href: appCss, as: "style" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,500;0,9..144,620;1,9..144,500&family=Outfit:wght@400;500;600&display=swap",
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
