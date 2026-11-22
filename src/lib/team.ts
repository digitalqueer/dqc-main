// Client-safe module: validation schemas shared by the team server functions
// and the admin team forms. Nothing here may touch server-only APIs. Keep
// imports relative: drizzle-kit loads the database schema, which may import
// from lib modules.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import { optionalText, reorderIdsSchema, requiredText } from "./validation";

/** A team member's details (everything but their bio), as edited in the admin form. */
export const teamMemberInputSchema = z.object({
  name: requiredText("Enter their name"),
  pronouns: optionalText(40),
});
/** Form-side shape: blank pronouns allowed. */
export type TeamMemberInput = z.input<typeof teamMemberInputSchema>;

export const teamMemberUpdateSchema = teamMemberInputSchema.extend({
  id: z.uuid(),
});

export const teamMemberIdSchema = z.object({ id: z.uuid() });

/** Whether a route param could be a team member id. */
export const isTeamMemberId = (value: string) =>
  teamMemberIdSchema.shape.id.safeParse(value).success;

export const teamReorderSchema = z.object({ ids: reorderIdsSchema });

/** Saving or publishing a bio from the editor. */
export const teamMemberBioSchema = z.object({
  id: z.uuid(),
  content: richTextDocumentSchema,
});
