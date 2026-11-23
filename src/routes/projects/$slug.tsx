import { createFileRoute } from "@tanstack/react-router";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { RichTextRenderer } from "@/components/rich-text/RichTextRenderer";
import { pageMeta } from "@/lib/share";
import { getPublishedProjectPage } from "@/server/functions/projects.functions";

export const Route = createFileRoute("/projects/$slug")({
  loader: ({ params }) =>
    getPublishedProjectPage({ data: { slug: params.slug } }),
  head: ({ loaderData }) =>
    loaderData
      ? {
          meta: pageMeta({
            title: loaderData.project.name,
            description: loaderData.project.description,
          }),
        }
      : {},
  component: RouteComponent,
});

function RouteComponent() {
  const { project, content, media } = Route.useLoaderData();

  return (
    <Main>
      <BreadcrumbNav current_page_label={project.name}>
        <BreadcrumbItem to="/projects">Projects</BreadcrumbItem>
      </BreadcrumbNav>
      <Prose>
        {/* Wrapped, so prose's no-margin-on-the-first-child rule needs repeating. */}
        <RichTextRenderer
          document={content}
          media={media}
          className="rich-text [&>:first-child]:mt-0"
        />
      </Prose>
    </Main>
  );
}
