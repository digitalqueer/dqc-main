import { createFileRoute } from "@tanstack/react-router";
import Main from "@/components/_ui/Main";
import { PostArticle, postHead } from "@/components/PostArticle";
import { getPublishedPost } from "@/server/functions/posts.functions";

export const Route = createFileRoute("/thoughts/$slug")({
  staticData: { breadcrumb: Breadcrumb },
  loader: ({ params }) =>
    getPublishedPost({ data: { kind: "thought", slug: params.slug } }),
  head: ({ loaderData }) => postHead(loaderData),
  component: RouteComponent,
});

// Annotated: its type can't be inferred from Route, whose options include it.
function Breadcrumb(): string {
  return Route.useLoaderData().post.title;
}

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <Main>
      <PostArticle {...data} />
    </Main>
  );
}
