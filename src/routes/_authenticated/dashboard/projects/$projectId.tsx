import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { ArrowUpRightIcon } from "lucide-react";
import { useState } from "react";
import { BreadcrumbItem, BreadcrumbNav } from "@/components/_ui/BreadcrumbNav";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import { PublishingEditor } from "@/components/rich-text/PublishingEditor";
import {
  getProjectPageEditor,
  publishProjectPage,
  saveProjectPageDraft,
  unpublishProjectPage,
} from "@/server/functions/projects.functions";

export const Route = createFileRoute(
  "/_authenticated/dashboard/projects/$projectId",
)({
  loader: ({ params }) =>
    getProjectPageEditor({ data: { id: params.projectId } }),
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `${loaderData?.project.name ?? "Project"} - Digital Queer Collective`,
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const data = Route.useLoaderData();
  // Keyed so moving between projects starts a fresh editor.
  return <ProjectPageEditor key={data.project.id} {...data} />;
}

type EditorData = Awaited<ReturnType<typeof getProjectPageEditor>>;

function ProjectPageEditor({
  project,
  content,
  status: loaded_status,
}: EditorData) {
  const save_draft = useServerFn(saveProjectPageDraft);
  const publish = useServerFn(publishProjectPage);
  const unpublish = useServerFn(unpublishProjectPage);
  const [status, set_status] = useState(loaded_status);

  return (
    <Main>
      <BreadcrumbNav current_page_label={project.name}>
        <BreadcrumbItem to="/dashboard">Dashboard</BreadcrumbItem>
        <BreadcrumbItem to="/dashboard/projects">Projects</BreadcrumbItem>
      </BreadcrumbNav>
      <PublishingEditor
        title={project.name}
        details={
          <p className="text-sm text-neutral-300 break-all">
            /projects/{project.id}
          </p>
        }
        noun="page"
        initial_content={content}
        status={status}
        on_status_change={set_status}
        save_draft={(content) =>
          save_draft({ data: { id: project.id, content } })
        }
        publish={(content) => publish({ data: { id: project.id, content } })}
        unpublish={() => unpublish({ data: { id: project.id } })}
        unpublish_confirmation={{
          title: `Unpublish the page for ${project.name}?`,
          description:
            "The project stays on the Projects page without a link to it. Your draft is kept, so you can publish it again later.",
        }}
        actions={
          status.isPublished && (
            <Link
              to="/projects/$slug"
              params={{ slug: project.id }}
              target="_blank"
            >
              View page
              <ArrowUpRightIcon strokeWidth={1.5} size={16} aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </Link>
          )
        }
        editor_label={`Page content for ${project.name}`}
        placeholder="Write about this project…"
      />
    </Main>
  );
}
