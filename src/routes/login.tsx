import { createFileRoute } from "@tanstack/react-router";
import { LogInIcon } from "lucide-react";
import * as z from "zod";
import Button from "@/components/_ui/Button";
import Main from "@/components/_ui/Main";
import { auth_client } from "@/lib/auth-client";

/**
 * ?redirect= is set by the _authenticated guard. Only a path on this site is
 * followed (not "//host" or "/\host", which browsers treat as another site);
 * anything else falls back to the dashboard.
 */
const loginSearchSchema = z.object({
  redirect: z
    .string()
    .regex(/^\/(?![/\\])/)
    .optional()
    .catch(undefined),
});

export const Route = createFileRoute("/login")({
  validateSearch: loginSearchSchema,
  component: RouteComponent,
});

function RouteComponent() {
  const { redirect } = Route.useSearch();

  return (
    <Main>
      <Button
        onClick={() =>
          auth_client.signIn.social({
            provider: "dqc",
            callbackURL: redirect ?? "/dashboard",
          })
        }
      >
        <LogInIcon strokeWidth={1.5} size={16} />
        <span>Sign In with DQC</span>
      </Button>
    </Main>
  );
}
