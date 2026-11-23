import { createFileRoute } from "@tanstack/react-router";

// The layout for every /thoughts page. It only renders the page (the default
// <Outlet />); it's here for the section's crumb, which then shows on the list
// and on each thought.
export const Route = createFileRoute("/thoughts")({
  staticData: { breadcrumb: "Thoughts" },
});
