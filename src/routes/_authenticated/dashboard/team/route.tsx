import { createFileRoute } from "@tanstack/react-router";

// The section's crumb, on its list and on each bio's editor.
export const Route = createFileRoute("/_authenticated/dashboard/team")({
  staticData: { breadcrumb: "Team" },
});
