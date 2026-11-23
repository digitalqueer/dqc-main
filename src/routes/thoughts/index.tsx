import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { ArrowRightIcon } from "lucide-react";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { PublishedDate } from "@/components/_ui/PublishedDate";
import { listPublishedThoughts } from "@/server/functions/posts.functions";

export const Route = createFileRoute("/thoughts/")({
  loader: () => listPublishedThoughts(),
  head: () => ({
    meta: [{ title: "Thoughts - Digital Queer Collective" }],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const thoughts = Route.useLoaderData();

  return (
    <Main>
      <Prose>
        <h2>Thoughts</h2>
        {thoughts.length === 0 && <p className="italic">Nothing here yet.</p>}
        {thoughts.map((thought) => {
          const summary = thought.description ?? thought.excerpt;
          return (
            <section key={thought.id}>
              <h3>
                <TanstackLink
                  className="no-underline font-bold"
                  to="/thoughts/$slug"
                  params={{ slug: thought.slug }}
                >
                  {thought.title}
                </TanstackLink>
              </h3>
              {summary && <p className="mb-4">{summary}</p>}
              <div className="flex items-center justify-between">
                <Link
                  to="/thoughts/$slug"
                  params={{ slug: thought.slug }}
                  className="-ml-3"
                >
                  <span>View Post</span>
                  <ArrowRightIcon strokeWidth={1.5} className="size-4" aria-hidden />
                </Link>
                {thought.publishedAt && (
                  <p className="text-sm m-0!">
                    <PublishedDate date={thought.publishedAt} />
                  </p>
                )}
              </div>
            </section>
          );
        })}
      </Prose>
    </Main>
  );
}
