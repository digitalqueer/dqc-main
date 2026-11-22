import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Main from "@/components/_ui/Main";
import { PostArticle, postHead } from "@/components/PostArticle";
import { getPublishedPost } from "@/server/functions/posts.functions";

export const Route = createFileRoute("/thoughts/$slug")({
  loader: ({ params }) =>
    getPublishedPost({ data: { kind: "thought", slug: params.slug } }),
  head: ({ loaderData }) => postHead(loaderData),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();

  return (
    <Main>
      <PostArticle
        {...data}
        breadcrumbs={
          <BreadcrumbNav current_page_label={data.post.title}>
            <BreadcrumbItem to="/thoughts">Thoughts</BreadcrumbItem>
          </BreadcrumbNav>
        }
      />
    </Main>
  );
}
