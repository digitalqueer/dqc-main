import { createFileRoute } from "@tanstack/react-router";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";

// A placeholder until the admin shell lands: contact requests first, then
// thoughts, projects and the team.
export const Route = createFileRoute("/_authenticated/dashboard/")({
  component: RouteComponent,
});

function RouteComponent() {
  const { user } = Route.useRouteContext();

  return (
    <Main>
      <Prose>
        <h2>Dashboard</h2>
        <p>
          Signed in as {user.name} ({user.email}).
        </p>
        <p>Contact requests and the site's content will be managed here.</p>
      </Prose>
    </Main>
  );
}
