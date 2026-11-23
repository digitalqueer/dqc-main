import { createFileRoute, Link as TanstackLink } from "@tanstack/react-router";
import { ArrowRightIcon, CodeIcon, ExternalLinkIcon } from "lucide-react";
import { Fragment } from "react";
import { buttonVariants } from "@/components/_ui/Button";
import Link from "@/components/_ui/Link";
import Main from "@/components/_ui/Main";
import Prose from "@/components/_ui/Prose";
import { projectDates } from "@/lib/projects";
import { pageMeta } from "@/lib/share";
import { cn } from "@/lib/utils";
import { listPublicProjects } from "@/server/functions/projects.functions";

export const Route = createFileRoute("/projects/")({
  loader: () => listPublicProjects(),
  head: () => ({
    meta: pageMeta({ title: "Projects" }),
  }),
  component: RouteComponent,
});

type PublicProject = Awaited<ReturnType<typeof listPublicProjects>>[number];

const EXTERNAL_LINK_CLASSES = cn(
  "flex items-center justify-between gap-2 text-sm",
  buttonVariants(),
);

/** Paragraphs from a plain-text description (blank lines separate them). */
function Description({ text }: { text: string }) {
  return text
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean)
    .map((paragraph, index) => <p key={index}>{paragraph}</p>);
}

function ProjectSummary({ project }: { project: PublicProject }) {
  return (
    <section>
      <h3>
        {project.hasPublishedPage ? (
          <TanstackLink
            className="no-underline font-bold"
            to="/projects/$slug"
            params={{ slug: project.id }}
          >
            {project.name}
          </TanstackLink>
        ) : (
          project.name
        )}
      </h3>
      {project.description && <Description text={project.description} />}
      <p className="text-sm">{projectDates(project)}</p>
      <div className="flex flex-wrap items-center justify-between gap-2 -ml-3">
        {project.hasPublishedPage && (
          <Link to="/projects/$slug" params={{ slug: project.id }}>
            <span>View Project</span>
            <ArrowRightIcon strokeWidth={1.5} className="size-4" aria-hidden />
          </Link>
        )}
        <div className="flex flex-wrap items-center gap-2 ml-auto">
          {project.websiteLink && (
            <a
              href={project.websiteLink}
              target="_blank"
              rel="noreferrer"
              className={EXTERNAL_LINK_CLASSES}
            >
              <span>View Website</span>
              <ExternalLinkIcon strokeWidth={1.5} className="size-4" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
          {project.sourceLink && (
            <a
              href={project.sourceLink}
              target="_blank"
              rel="noreferrer"
              className={EXTERNAL_LINK_CLASSES}
            >
              <span>View Source</span>
              <CodeIcon strokeWidth={1.5} className="size-4" aria-hidden />
              <span className="sr-only"> (opens in a new tab)</span>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}

function RouteComponent() {
  const projects = Route.useLoaderData();
  const active = projects.filter(({ isActive }) => isActive);
  const past = projects.filter(({ isActive }) => !isActive);

  return (
    <Main>
      <Prose>
        <h2>Projects</h2>
        {projects.length === 0 && <p className="italic">Nothing here yet.</p>}
        {active.map((project) => (
          <ProjectSummary key={project.id} project={project} />
        ))}
        {past.length > 0 && (
          <Fragment>
            <h2>Past Projects</h2>
            {past.map((project) => (
              <ProjectSummary key={project.id} project={project} />
            ))}
          </Fragment>
        )}
      </Prose>
    </Main>
  );
}
