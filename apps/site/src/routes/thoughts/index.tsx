import { createFileRoute } from "@tanstack/react-router";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import Link from "@/components/_ui/Link";
import { Link as TanstackLink } from "@tanstack/react-router";
import { getThoughtsListServerFn } from "@/server/thoughts/thoughts.functions";
import { ArrowRightIcon } from "lucide-react";

export const Route = createFileRoute("/thoughts/")({
  component: RouteComponent,
  ssr: true,
  loader: () => getThoughtsListServerFn(),
});

function RouteComponent() {
  const entries = Route.useLoaderData();

  return (
    <Main>
      <Prose>
        <h2>Thoughts</h2>
        {entries.map((entry) => (
          <section key={entry.slug}>
            <h3>
              <TanstackLink
                className="no-underline font-bold"
                to="/thoughts/$slug"
                params={{ slug: entry.slug }}
              >
                {entry.title}
              </TanstackLink>
            </h3>
            {entry.description && <p className="mb-4">{entry.description}</p>}
            <div className="flex items-center justify-between">
              <Link
                to="/thoughts/$slug"
                params={{ slug: entry.slug }}
                className="-ml-3"
              >
                <span>View Post</span>
                <ArrowRightIcon strokeWidth={1.5} className="size-4" />
              </Link>
              {entry.publishedAt && (
                <p className="text-sm m-0!">
                  {entry.publishedAt?.toLocaleDateString()}
                </p>
              )}
            </div>
          </section>
        ))}
        {/*<h2>Statements</h2>*/}
      </Prose>
    </Main>
  );
}
