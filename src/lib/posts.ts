// Client-safe module: constants and validation schemas shared by the post
// server functions (inputs) and the admin post forms. Nothing here may touch
// server-only APIs. Keep imports relative: drizzle-kit loads the database
// schema, which imports from here.
import * as z from "zod";
import { richTextDocumentSchema } from "./rich-text";
import { identifierSchema, optionalText, requiredText } from "./validation";

/**
 * Posts are thoughts (/thoughts/{slug}, listed on /thoughts) or statements
 * (/statements/{slug}, DQC's standing positions, e.g. on ethics).
 */
export const POST_KINDS = ["thought", "statement"] as const;
export type PostKind = (typeof POST_KINDS)[number];

export const POST_KIND_LABELS: Record<PostKind, string> = {
  thought: "Thought",
  statement: "Statement",
};

/** Where a published post of each kind lives. */
export const POST_KIND_PATHS: Record<PostKind, "/thoughts" | "/statements"> = {
  thought: "/thoughts",
  statement: "/statements",
};

export const POST_TITLE_MAX_LENGTH = 200;
export const POST_DESCRIPTION_MAX_LENGTH = 600;
export const POST_AUTHOR_MAX_LENGTH = 200;
/** How much of the opening text becomes the summary when there's no description. */
export const POST_EXCERPT_LENGTH = 240;

/** A post's details (everything but its content), as edited in the admin form. */
export const postInputSchema = z.object({
  kind: z.enum(POST_KINDS),
  slug: identifierSchema,
  title: requiredText("Enter a title", POST_TITLE_MAX_LENGTH),
  author: optionalText(POST_AUTHOR_MAX_LENGTH),
  description: optionalText(POST_DESCRIPTION_MAX_LENGTH),
});
/** Form-side shape: blank author and description allowed. */
export type PostInput = z.input<typeof postInputSchema>;

export const postUpdateSchema = postInputSchema.extend({ id: z.uuid() });

export const postIdSchema = z.object({ id: z.uuid() });

/** Whether a route param could be a post id (so bad URLs 404 instead of erroring). */
export const isPostId = (value: string) =>
  postIdSchema.shape.id.safeParse(value).success;

export const postSlugSchema = z.object({ slug: z.string().min(1).max(200) });

/** Saving or publishing a post's content from the editor. */
export const postContentSchema = z.object({
  id: z.uuid(),
  content: richTextDocumentSchema,
});

/** A short list, e.g. the latest posts on the dashboard. */
export const postListLimitSchema = z.object({
  limit: z.number().int().min(1).max(20),
});
