import { createFileRoute } from "@tanstack/react-router";
import { shareCardResponse } from "@/server/og/cards.server";

// Server route: the share card (og:image) for the page at the rest of the
// path: /og/thoughts/hello for /thoughts/hello, and /og for the home page.
// The root route points every page here. See server/og/cards.server.tsx.
export const Route = createFileRoute("/og/$")({
  server: {
    handlers: {
      GET: ({ request, params }) => {
        const path = `/${params._splat ?? ""}`.replace(/(.)\/+$/, "$1");
        return shareCardResponse(request, path);
      },
    },
  },
});
