import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { ArrowRightIcon, RssIcon } from "lucide-react";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { PublishedDate } from "@/components/_ui/PublishedDate";
import { THOUGHTS_FEED_PATH } from "@/lib/posts";
import { pageMeta } from "@/lib/share";
import { listPublishedThoughts } from "@/server/functions/posts.functions";

export const Route = createFileRoute("/thoughts/")({
  loader: () => listPublishedThoughts(),
  head: () => ({
    meta: pageMeta({ title: "Thoughts" }),
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const thoughts = Route.useLoaderData();

  return (
    <Main>
      <Prose>
        {/* Prose's h2 margins go on the row (its first child loses the top one). */}
        <div className="mb-6 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <h2 className="my-0!">Thoughts</h2>
          <Link
            href={THOUGHTS_FEED_PATH}
            type="application/rss+xml"
            className="-mr-3"
          >
            <RssIcon strokeWidth={1.5} className="size-4" aria-hidden />
            <span>RSS Feed</span>
          </Link>
        </div>
        {thoughts.length === 0 && <p className="italic">Nothing here yet.</p>}
        {thoughts.map((thought) => {
          const summary = thought.description ?? thought.excerpt;
          return (
            <section key={thought.id}>
              <h3>
                <TanstackLink
                  className="font-bold no-underline"
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
                  <ArrowRightIcon
                    strokeWidth={1.5}
                    className="size-4"
                    aria-hidden
                  />
                </Link>
                {thought.publishedAt && (
                  <p className="m-0! text-sm">
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
