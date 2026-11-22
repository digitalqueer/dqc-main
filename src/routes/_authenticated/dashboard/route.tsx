import { createFileRoute } from "@tanstack/react-router";

// The layout for every admin page. It only renders the page (the default
// <Outlet />); it's here for the Dashboard crumb at the start of their trails.
export const Route = createFileRoute("/_authenticated/dashboard")({
  staticData: { breadcrumb: "Dashboard" },
});
