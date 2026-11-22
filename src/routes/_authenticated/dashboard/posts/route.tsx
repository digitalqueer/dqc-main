import { createFileRoute } from "@tanstack/react-router";

// The section's crumb, on its list and on each post's editor.
export const Route = createFileRoute("/_authenticated/dashboard/posts")({
  staticData: { breadcrumb: "Thoughts & Statements" },
});
