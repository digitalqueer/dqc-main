import { createFileRoute } from "@tanstack/react-router";
import { buildThoughtsFeed } from "@/server/feed.server";
import { matchesEtag, resolveSiteOrigin } from "@/server/http.server";

// Feed readers poll; let them (and any CDN) reuse a copy for 15 minutes, then
// revalidate with If-None-Match.
const CACHE_CONTROL = "public, max-age=900";

// Server route: the RSS feed of published thoughts (see server/feed.server.ts).
export const Route = createFileRoute("/rss.xml")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { xml, etag } = await buildThoughtsFeed(
          resolveSiteOrigin(request.url),
        );
        const headers = { "Cache-Control": CACHE_CONTROL, ETag: etag };
        if (matchesEtag(request.headers.get("if-none-match"), etag)) {
          return new Response(null, { status: 304, headers });
        }
        return new Response(xml, {
          headers: {
            ...headers,
            "Content-Type": "application/rss+xml; charset=utf-8",
          },
        });
      },
    },
  },
});
