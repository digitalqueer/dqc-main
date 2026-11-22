import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";
import { AlertDialogProvider } from "@/components/_ui/AlertDialog";
import { getSession } from "@/server/functions/auth.functions";

// Hides the admin pages from anyone signed out. The data is protected by
// ensure_auth_middleware on each admin server function, not by this.
export const Route = createFileRoute("/_authenticated")({
  beforeLoad: async ({ location }) => {
    const session = await getSession();

    if (!session) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    return { user: session.user };
  },
  head: () => ({
    // Signed-in pages; nothing here belongs in search results.
    meta: [{ name: "robots", content: "noindex" }],
  }),
  // Lets admin pages ask before deleting or leaving (see useConfirm).
  component: () => (
    <AlertDialogProvider>
      <Outlet />
    </AlertDialogProvider>
  ),
});
