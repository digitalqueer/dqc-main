import {
  ClientOnly,
  HeadContent,
  Scripts,
  createRootRoute,
} from "@tanstack/react-router";

import appCss from "../styles/styles.css?url";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import Header from "@/components/_ui/Header";
import Footer from "@/components/_ui/Footer";
import { ToastProvider } from "@/components/_ui/Toast";

// Dev only. `import.meta.env.DEV` is false in production builds, so this
// import (and the devtools packages) are dropped from them entirely.
const Devtools = import.meta.env.DEV
  ? lazy(() => import("@/components/_ui/Devtools"))
  : null;

export const Route = createRootRoute({
  head: () => ({
    meta: [
      {
        charSet: "utf-8",
      },
      {
        name: "viewport",
        content: "width=device-width, initial-scale=1",
      },
      {
        title: "Digital Queer Collective - Social Enterprise",
      },
    ],
    links: [
      {
        rel: "stylesheet",
        href: appCss,
      },
      {
        rel: "preconnect",
        href: "https://challenges.cloudflare.com",
      },
    ],
    scripts: [
      {
        defer: true,
        "data-domain": "dqc.dev",
        src: "https://analytics.dqc.dev/js/script.js",
      },
      {
        defer: true,
        src: "https://challenges.cloudflare.com/turnstile/v0/api.js",
      },
    ],
  }),
  shellComponent: RootDocument,
  loader: () => {
    const options = [
      "DigitalQueerCollective",
      "digitalQueerCollective",
      "digital_queer_collective",
      "DigitalQueer",
      "digitalQueer",
      "digital_queer",
      "DQC",
      "dqc",
    ];
    const initialOptionIndex = Math.floor(Math.random() * options.length);
    return { options, initialOptionIndex };
  },
});

function RootDocument({ children }: { children: React.ReactNode }) {
  const { options, initialOptionIndex } = Route.useLoaderData();
  const [titleOption, setTitleOption] = useState(initialOptionIndex);

  const title = useMemo(() => {
    return options[titleOption];
  }, [titleOption, options]);

  const handleTitleRandomize = useCallback(() => {
    setTitleOption(Math.floor(Math.random() * options.length));
  }, [options]);

  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body className="root flex min-h-dvh flex-col bg-neutral-900 text-neutral-100">
        <Header title={title} onTitleRandomize={handleTitleRandomize} />
        <ToastProvider placement="top">{children}</ToastProvider>
        <Footer />
        {Devtools && (
          // Browser only: the devtools throw if they're loaded on the server.
          <ClientOnly>
            <Suspense>
              <Devtools />
            </Suspense>
          </ClientOnly>
        )}
        <Scripts />
      </body>
    </html>
  );
}
