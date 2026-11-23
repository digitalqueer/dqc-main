import { createFileRoute } from "@tanstack/react-router";

// The section's crumb, on its list and on each project's editor.
export const Route = createFileRoute("/_authenticated/dashboard/projects")({
  staticData: { breadcrumb: "Projects" },
});
