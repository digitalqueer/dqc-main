import { notFound } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { setResponseStatus } from "@tanstack/react-start/server";
import { hasRichTextContent, toPublishStatus } from "@/lib/rich-text";
import {
  teamMemberBioSchema,
  teamMemberIdSchema,
  teamMemberInputSchema,
  teamMemberUpdateSchema,
  teamReorderSchema,
} from "@/lib/team";
import { ensure_auth_middleware } from "@/server/middleware/auth.middleware";
import { team_middleware } from "@/server/middleware/team.middleware";

// <-- Public -->

/** "Our Team" on /about: everyone with a published bio, in order. */
export const listPublishedTeam = createServerFn({ method: "GET" })
  .middleware([team_middleware])
  .handler(async ({ context }) => {
    const rows = await context.team.listPublishedTeamMembers();
    // The query only returns published bios; this narrows the type.
    return rows.flatMap(({ bio, ...member }) => (bio ? [{ ...member, bio }] : []));
  });

// <-- Admin -->

/** Everyone, in order, with their bio's publish status (not the bios). */
export const listTeamMembers = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, team_middleware])
  .handler(async ({ context }) => {
    const rows = await context.team.listTeamMembers();
    return rows.map(({ id, name, pronouns, ...bio }) => ({
      id,
      name,
      pronouns,
      status: toPublishStatus(bio),
    }));
  });

export const createTeamMember = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberInputSchema)
  .handler(({ context, data }) => context.team.createTeamMember(data));

export const updateTeamMember = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberUpdateSchema)
  .handler(async ({ context, data: { id, ...details } }) => {
    const member = await context.team.updateTeamMember(id, details);
    if (!member) throw notFound();
    return member;
  });

export const deleteTeamMember = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberIdSchema)
  .handler(async ({ context, data }) => {
    const member = await context.team.deleteTeamMember(data.id);
    if (!member) throw notFound();
    return member;
  });

export const reorderTeamMembers = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamReorderSchema)
  .handler(async ({ context, data }) => {
    await context.team.reorderTeamMembers(data.ids);
    return { success: true as const };
  });

/** Editor: the member, their saved draft bio, and its publish status. */
export const getBioEditor = createServerFn({ method: "GET" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberIdSchema)
  .handler(async ({ context, data }) => {
    const row = await context.team.getTeamMember(data.id);
    if (!row) throw notFound();
    return {
      member: { id: row.id, name: row.name, pronouns: row.pronouns },
      content: row.draftContent,
      status: toPublishStatus(row),
    };
  });

export const saveBioDraft = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberBioSchema)
  .handler(async ({ context, data }) => {
    const row = await context.team.saveBioDraft(data.id, data.content);
    if (!row) throw notFound();
    return toPublishStatus(row);
  });

export const publishBio = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberBioSchema)
  .handler(async ({ context, data }) => {
    if (!hasRichTextContent(data.content)) {
      setResponseStatus(400);
      throw new Error("Write something before publishing.");
    }
    const row = await context.team.publishBio(data.id, data.content);
    if (!row) throw notFound();
    return toPublishStatus(row);
  });

export const unpublishBio = createServerFn({ method: "POST" })
  .middleware([ensure_auth_middleware, team_middleware])
  .validator(teamMemberIdSchema)
  .handler(async ({ context, data }) => {
    const row = await context.team.unpublishBio(data.id);
    if (!row) throw notFound();
    return toPublishStatus(row);
  });
