import { createFileRoute } from "@tanstack/react-router";

// The layout for every /statements page, for their crumb. They're listed on
// the About page, so that's where it links (/statements redirects there).
export const Route = createFileRoute("/statements")({
  staticData: { breadcrumb: "About", breadcrumb_to: "/about" },
});
