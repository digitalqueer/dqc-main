import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import {
  projectIdSchema,
  projectInputSchema,
  projectListLimitSchema,
  projectPageContentSchema,
  projectReorderSchema,
  projectSlugSchema,
} from "@/lib/projects";
import { hasRichTextContent, toPublishStatus } from "@/lib/rich-text";
import { ensure_auth_middleware } from "@/server/middleware/auth.middleware";
import { projects_middleware } from "@/server/middleware/projects.middleware";

// <-- Public -->

/** /projects: every project, flagged with whether it has a page to read. */
export const listPublicProjects = createServerFn({ method: "GET" })
  .middleware([projects_middleware])
  .handler(({ context }) => context.projects.listProjectsWithPageStatus());

/** The first few active projects, e.g. for the home page. */
export const listActiveProjects = createServerFn({ method: "GET" })
  .middleware([projects_middleware])
  .validator(projectListLimitSchema)
  .handler(({ context, data }) =>
    context.projects.listActiveProjects(data.limit),
  );

/**
 * /projects/{slug}: the project and its published page. A project without a
 * published page has no page to show (the Projects list doesn't link to it).
 */
export const getPublishedProjectPage = createServerFn({ method: "GET" })
  .middleware([projects_middleware])
  .validator(projectSlugSchema)
  .handler(async ({ context, data }) => {
    const [project, page] = await Promise.all([
      context.projects.getProject(data.slug),
      context.projects.getProjectPage(data.slug),
    ]);
    if (!project || !page?.publishedContent || !page.publishedAt) {
      throw notFound();
    }
    return {
      project,
      content: page.publishedContent,
      publishedAt: page.publishedAt,
    };
  });

// <-- Admin -->

export const listProjects = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .handler(({ context }) => context.projects.listProjectsWithPageStatus());

export const createProject = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectInputSchema)
  .handler(async ({ context, data }) => {
    if (await context.projects.getProject(data.id)) {
      setResponseStatus(409);
      throw new Error(
        `Another project already uses the slug "${data.id}". Pick a different one.`,
      );
    }
    return await context.projects.createProject(data);
  });

export const updateProject = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectInputSchema)
  .handler(async ({ context, data }) => {
    const project = await context.projects.updateProject(data);
    if (!project) throw notFound();
    return project;
  });

export const deleteProject = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    const project = await context.projects.deleteProject(data.id);
    if (!project) throw notFound();
    return project;
  });

export const reorderProjects = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectReorderSchema)
  .handler(async ({ context, data }) => {
    await context.projects.reorderProjects(data.status === "active", data.ids);
    return { success: true as const };
  });

/** Editor: the project, its page's saved draft, and publish status. */
export const getProjectPageEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    const [project, page] = await Promise.all([
      context.projects.getProject(data.id),
      context.projects.getProjectPage(data.id),
    ]);
    if (!project) throw notFound();
    return {
      project,
      content: page?.draftContent ?? null,
      status: toPublishStatus(page),
    };
  });

export const saveProjectPageDraft = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectPageContentSchema)
  .handler(async ({ context, data }) => {
    if (!(await context.projects.getProject(data.id))) throw notFound();
    const page = await context.projects.saveProjectPageDraft(
      data.id,
      data.content,
    );
    return toPublishStatus(page);
  });

export const publishProjectPage = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectPageContentSchema)
  .handler(async ({ context, data }) => {
    if (!hasRichTextContent(data.content)) {
      setResponseStatus(400);
      throw new Error("Write something before publishing.");
    }
    if (!(await context.projects.getProject(data.id))) throw notFound();
    const page = await context.projects.publishProjectPage(
      data.id,
      data.content,
    );
    return toPublishStatus(page);
  });

export const unpublishProjectPage = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, projects_middleware])
  .validator(projectIdSchema)
  .handler(async ({ context, data }) => {
    const page = await context.projects.unpublishProjectPage(data.id);
    if (!page) throw notFound();
    return toPublishStatus(page);
  });
