import { createRouter as createTanstackRouter } from "@tanstack/react-router";
import type { ComponentType } from "react";
import ErrorView from "./components/_ui/ErrorView";
import NotFound from "./components/_ui/NotFound";
// Import the generated route tree
import { routeTree } from "./routeTree.gen";

// Create a new router instance
export const getRouter = () => {
  return createTanstackRouter({
    routeTree,
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    defaultErrorComponent: ErrorView,
    defaultNotFoundComponent: NotFound,
  });
};

// Register the router instance for type safety
declare module "@tanstack/react-router" {
  interface Register {
    router: ReturnType<typeof getRouter>;
  }
  interface StaticDataRouteOption {
    /**
     * This route's crumb in the page's breadcrumbs (components/_ui/Breadcrumbs.tsx),
     * linking to the route's path. A label, or a component that returns one
     * when it depends on the page (e.g. a post's title, from
     * `Route.useLoaderData()`). Routes without one add no crumb, so a
     * section's crumb goes on its layout route (`thoughts/route.tsx`), not on
     * its index route. Share cards use the same crumbs (server/og/cards.server.tsx).
     */
    breadcrumb?: string | ComponentType;
    /**
     * Where the crumb links instead, when the route's own path isn't a page
     * (e.g. /statements, which redirects to /about, where they're listed).
     */
    breadcrumb_to?: string;
  }
}
