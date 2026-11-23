import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Main from "@/components/_ui/Main";
import { PostArticle, postHead } from "@/components/PostArticle";
import { getPublishedPost } from "@/server/functions/posts.functions";

// DQC's statements (e.g. on ethics), linked from the About page.
export const Route = createFileRoute("/statements/$slug")({
  loader: ({ params }) =>
    getPublishedPost({ data: { kind: "statement", slug: params.slug } }),
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
            <BreadcrumbItem to="/about">About</BreadcrumbItem>
          </BreadcrumbNav>
        }
      />
    </Main>
  );
}
