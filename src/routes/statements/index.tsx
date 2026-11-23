import { createFileRoute, redirect } from "@tanstack/react-router";

// /statements isn't a page of its own: the statements are listed on About.
export const Route = createFileRoute("/statements/")({
  beforeLoad: () => {
    throw redirect({ to: "/about" });
  },
});
