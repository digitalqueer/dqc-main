import { createServerFileRoute } from "@tanstack/react-start/server";

export const ServerRoute = createServerFileRoute("/health").methods({
  GET: async () => {
    return new Response(JSON.stringify({ status: "OK" }), { status: 200 });
  },
});
