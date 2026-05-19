import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { getThoughtPostServerFn } from "@/server/thoughts/thoughts.functions";
import { createFileRoute, notFound } from "@tanstack/react-router";
import { ChevronRightIcon } from "lucide-react";
import Markdown from "react-markdown";

export const Route = createFileRoute("/thoughts/$slug")({
  component: RouteComponent,
  async loader({ params }) {
    const data = await getThoughtPostServerFn({ data: { slug: params.slug } });
    if (!data) throw notFound();
    return data;
  },
});

function RouteComponent() {
  const params = Route.useParams();
  const { data, content } = Route.useLoaderData();

  return (
    <Main>
      <div className="-ml-2 flex items-center gap-2">
        <Link size="sm" to="/thoughts">
          <span>Thoughts</span>
        </Link>
        <ChevronRightIcon strokeWidth={1.5} size={16} />
        <Link size="sm" to="/thoughts/$slug" params={params} disabled>
          <span>{data.title}</span>
        </Link>
      </div>
      <Prose>
        <h2 className="mb-2">{data.title}</h2>
        <p className="text-sm">Written by {data.author}</p>
        <Markdown>{content}</Markdown>
        {data.publishedAt && (
          <p className="text-neutral-400">
            Published at {data.publishedAt?.toLocaleDateString()}
          </p>
        )}
      </Prose>
    </Main>
  );
}
