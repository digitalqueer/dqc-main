import {
  ClientOnly,
  createRootRoute,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { lazy, Suspense, useCallback, useMemo, useState } from "react";
import Footer from "@/components/_ui/Footer";
import Header from "@/components/_ui/Header";
import { ToastProvider } from "@/components/_ui/Toast";
import { THOUGHTS_FEED_PATH, THOUGHTS_FEED_TITLE } from "@/lib/posts";
import {
  previewMeta,
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_TITLE,
  shareCardPath,
  shareImageMeta,
  withoutTrailingSlash,
} from "@/lib/share";
import { getSiteOrigin } from "@/server/functions/site.functions";
import appCss from "../styles/styles.css?url";

// Dev only. `import.meta.env.DEV` is false in production builds, so this
// import (and the devtools packages) are dropped from them entirely.
const Devtools = import.meta.env.DEV
  ? lazy(() => import("@/components/_ui/Devtools"))
  : null;

export const Route = createRootRoute({
  // The first crumb on every page (see components/_ui/Breadcrumbs.tsx).
  staticData: { breadcrumb: "Home" },
  head: ({ loaderData, matches }) => {
    const origin = loaderData?.origin;
    const path = withoutTrailingSlash(matches.at(-1)?.pathname ?? "/");
    return {
      // Defaults for every page. A page's own head wins, tag by tag (see
      // pageMeta in lib/share.ts).
      meta: [
        {
          charSet: "utf-8",
        },
        {
          name: "viewport",
          content: "width=device-width, initial-scale=1",
        },
        { title: SITE_TITLE },
        ...previewMeta("title", SITE_NAME),
        { name: "description", content: SITE_DESCRIPTION },
        ...previewMeta("description", SITE_DESCRIPTION),
        { property: "og:site_name", content: SITE_NAME },
        { property: "og:type", content: "website" },
        { name: "twitter:card", content: "summary_large_image" },
        // Link previews need absolute URLs. The image is the page's
        // generated card (routes/og/$.ts).
        ...(origin
          ? [
              ...previewMeta("url", origin + path),
              ...shareImageMeta(origin + shareCardPath(path)),
            ]
          : []),
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
        // Lets browsers and feed readers find the RSS feed from any page.
        {
          rel: "alternate",
          type: "application/rss+xml",
          title: THOUGHTS_FEED_TITLE,
          href: THOUGHTS_FEED_PATH,
        },
      ],
      scripts: [
        {
          defer: true,
          "data-domain": "dqc.dev",
          src: "https://analytics.dqc.dev/js/script.js",
        },
      ],
    };
  },
  shellComponent: RootDocument,
  // Nothing here changes while the site is open, so it's loaded once rather
  // than on every navigation (the origin is a server call).
  staleTime: Infinity,
  loader: async () => {
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
    return { options, initialOptionIndex, origin: await getSiteOrigin() };
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
